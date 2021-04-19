import React, {Component, forwardRef, useState } from 'react'
import './App.css'
import axios from 'axios';
import { ChevronLeft, ChevronRight,FirstPage,LastPage } from "@material-ui/icons";
import MaterialTable from "material-table";
const Papa = require('papaparse')

const rows = {}

const tableIcons = {
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />)
}

function CreateTable(rows, setColumns, setData){
    setColumns([
        {title:'Transaction Type', field:'Transaction Type'},
        {title:'Date', field:'Date'},
        {title:'Amount Debited', field:'Amount Debited'},
        {title:'Debit Currency', field:'Debit Currency'},
        {title:'Amount Credited', field:'Amount Credited'},
        {title:'Credit Currency', field:'Credit Currency'},
        {title:'Buy/Sell rate', field:'Buy/Sell rate'},
        {title:'Credit/Debit', field:'Credit/Debit'},
        {title:'Spot Rate', field:'Spot Rate'},
        {title:'Address', field:'Address'},
        {title:'Blockchain Transaction ID', field:'Blockchain Transaction ID'},
        ]);
    setData(rows.data)

}

function ReadCSV(file, setColumns, setData){
    Papa.parse(file,{
        header: true,
        skipEmptyLines: true,
        complete: function(results){
            rows.data = results.data
            rows.errors = results.errors
            rows.meta = results.meta
            CreateTable(rows,setColumns, setData)
        }
    })
}
function UserInput(){
    const [selectedFile, setSelectedFile] = useState(null)
    const [wallet, setWallet] = useState(null)
    const [columns, setColumns] = useState([])
    const [data, setData] = useState([])
    let table;
    if (columns.length == 0 && data.length == 0){
        table = null;
    }
    else{
        table = <MaterialTable
            icons = {tableIcons}
            title = "table"
            columns = {columns}
            data = {data}
            options = {{
                search : false,
                filtering : false,
                sorting: false,
                draggable: false
            }}
        />
    }
    return (
        <div>
            <input type="file" name="file" onChange={event => setSelectedFile(event.target.files[0])} />
            <input type="text" name="wallet"onChange={event => setWallet(event.target.txt)}/>
            <button type="button" class="btn btn-success btn-block" onClick={() => Upload(selectedFile, wallet, setColumns, setData)}>Upload</button>
            {table}
        </div>
    )
}
function Upload(selectedFile, wallet, setColumns, setData){
    ReadCSV(selectedFile, setColumns, setData)
    const data = new FormData()
    data.append('file', selectedFile)
    data.append('wallet', wallet)
    axios.post("http://localhost:5000/upload", data, {
        }).then(res => {

            })
}
class App extends Component {

    render(){

        return (
        <div>
            <UserInput/>
        </div>
    );}

}

export default App;
