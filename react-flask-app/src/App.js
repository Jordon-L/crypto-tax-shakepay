import React, {Component} from 'react'
import './App.css'
import axios from 'axios';;

const Papa = require('papaparse')

const rows = {}
function readCSV(file){
    Papa.parse(file,{
        header: true,
        skipEmptyLines: true,
        complete: function(results){
            rows.data = results.data
            rows.errors = results.errors
            rows.meta = results.meta
        }
    })
}

class App extends Component {


    onChangeHandler=event=>{
        this.setState({
            selectedFile: event.target.files[0],
            wallet: event.target.txt,
            loaded: 0,
        })
    }

    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
            wallet: null
        }
    }

    onClickHandler = () => {
        const data = new FormData()
        data.append('file', this.state.selectedFile)
        data.append('wallet', this.state.wallet)
        axios.post("http://localhost:5000/upload", data, {

        }).then(res => {
            readCSV(this.state.selectedFile)
            console.log(rows)
            })
    }

    render(){    return (
        <div>
            <input type="file" name="file" onChange={this.onChangeHandler}/>
            <input type="text" name="wallet"/>
            <button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button>
            </div>
    );}

}

export default App;
