import React, { Component, useRef } from "react";

import "./App.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Chart from "react-google-charts";

export default class App extends Component {
	state = {
		name: "buck",
		distance: "20",
		file: "",
		Mn: "",
		Md: "",
	};

	handleChange = async (e) => {
		await this.setState({
			[`${e.target.id}`]: e.target.value,
		});
	};

	handleFile = (e) => {
		const fileReader = new FileReader();
		fileReader.readAsText(e.target.files[0], "UTF-8");
		fileReader.onload = (e) => {
			this.setState({
				file: JSON.parse(e.target.result),
			});
		};
	};

	componentDidUpdate = () => {
		let { file, Mn } = this.state;
		if (file) {
			console.log("file uploaded");
		}
		// if (Mn) {
		// 	console.log(Mn);
		// }
	};

	componentDidMount() {
		const canvas = this.refs.canvas;
		const ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.rect(0, 0, 333, 277);
		ctx.stroke();
	}

	handleSubmit = async (e) => {
		e.preventDefault();

		let { file, name, distance } = this.state;
		let Mn = [];
		let Md = [];
		let nodeNames = [];
		let connectedNodes = [];
		if (file && name && distance) {
			// iterate through file data to determine the set (Mn) of nodes whose name contains N:
			file.forEach((node) => {
				if (node.name.toLowerCase().includes(name)) {
					Mn.push(node);
					nodeNames.push(node.name);
				}
			});

			// Determine the set of nodes which are no further than D from a node in Mn when travelling along the connections between the nodes: call this set of elements Md.
			// Get array of nodes connected to nodes in Mn
			file.forEach((node) => {
				let continueCheckingNode = true;
				if (continueCheckingNode) {
					node.connections.forEach((connection) => {
						nodeNames.forEach((nodeName) => {
							if (connection.includes(nodeName) && continueCheckingNode) {
								connectedNodes.push(node);
								continueCheckingNode = false;
							}
						});
					});
				}
			});
		}

		// d=√((x_2-x_1)²+(y_2-y_1)²) distance between two points
		const distanceFormula = (x, y, xx, yy) => {
			let value = Math.sqrt(Math.pow(xx - x, 2) + Math.pow(yy - y, 2));
			return value;
		};
		// check distance between each node in connected node set with each node in Mn set, for those connected nodes within distance, store in Md
		connectedNodes.forEach((connectedNode) => {
			let pushNode = true;
			Mn.forEach((nodeOfMn) => {
				if (
					distance >=
					distanceFormula(
						connectedNode.x,
						connectedNode.y,
						nodeOfMn.x,
						nodeOfMn.y
					)
				) {
					if (pushNode) {
						Md.push(connectedNode);
						pushNode = false;
					}
				}
			});
		});

		await this.setState({
			Mn: Mn,
			Md: Md,
		});
		console.log(this.state);

		this.displayPlots();
	};

	displayPlots = () => {
		const canvas = this.refs.canvas;
		const ctx = canvas.getContext("2d");
		let { Md, Mn } = this.state;
		console.log(Md);
		console.log(Mn);
		let scale = 6;
		Md.forEach((node) => {
			ctx.fillStyle = "blue";
			ctx.fillRect(node.x * scale, node.y * scale, 10, 10);
		});
		Mn.forEach((node) => {
			ctx.fillStyle = "green";
			ctx.fillRect(node.x * scale, node.y * scale, 10, 10);
		});
	};

	render() {
		return (
			<div>
				<Form>
					<Form.Group>
						<Form.File
							id="exampleFormControlFile1"
							label="JSON File"
							onChange={this.handleFile}
						/>
					</Form.Group>
					<Form.Group>
						<Form.Label>Name</Form.Label>
						<Form.Control
							type="text"
							id="name"
							onChange={this.handleChange}
							placeholder={this.state.name}
						/>
					</Form.Group>
					<Form.Group>
						<Form.Label>Distance</Form.Label>
						<Form.Control
							type="text"
							id="distance"
							onChange={this.handleChange}
							placeholder={this.state.distance}
						/>
					</Form.Group>
					<Button variant="primary" type="submit" onClick={this.handleSubmit}>
						Submit
					</Button>
				</Form>
				<div style={{ marginLeft: "20px", marginTop: "20px" }}>
					<canvas ref="canvas" width={333} height={277} />
				</div>
			</div>
		);
	}
}
