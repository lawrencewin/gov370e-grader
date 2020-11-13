import React from "react"
import "./App.css"
import Grader from "./Grader"

function App () {
  	return (
		<div className="app">
			<h1>GOV 370E Grader</h1>
			<p>Figure out your grade for Professor Theriault's Congressional Elections class. Extra credit isn't included so you'll have to calculate that yourself.</p>
			<Grader />
		</div>
  	);
}

export default App
