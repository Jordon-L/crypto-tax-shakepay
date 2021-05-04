import React, {Component, forwardRef, useState } from 'react'
import './App.css'
import axios from 'axios';
import { ChevronLeft, ChevronRight, FirstPage, LastPage, DeleteOutline, Check, Clear } from "@material-ui/icons";
import MaterialTable from "material-table";
const Papa = require('papaparse')

const rows = {}

const tableIcons = {
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref = {ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref =  {ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref = {ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref = {ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref = {ref} />),
    Clear: forwardRef((props,ref) => <Clear {...props} ref= {ref} />),
    Check : forwardRef((props,ref) => <Check {...props} ref= {ref} />),
}

function CreateTable(rows ,columns, setColumns, setData){
    setColumns(columns);
    setData(rows)
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
    const [taxInfo, setTaxInfo] = useState({})
    let table;
    if (columns.length === 0 && data.length === 0){
        table = null;
    }
    else{
        table =
        <div>
            <MaterialTable
                icons = {tableIcons}
                title = "table"
                columns = {columns}
                data = {data}
                options = {{
                    search : false,
                    filtering : false,
                    sorting: false,
                    draggable: false,
                }}
                editable = {{
                    onRowDelete: oldData =>
                        new Promise((resolve, reject) => {
                            setTimeout(() => {
                                const dataDelete = [...data];
                                const index = oldData.tableData.id;
                                dataDelete.splice(index,1);
                                setData([...dataDelete]);

                                resolve()
                            }, 1000)
                        }),
                }}
            />
            <div id = "tax" >
                <p>Income Gain: {taxInfo.incomeGain}</p>
                <p>Capital Gain: {taxInfo.capitalGain}</p>
                <p>Capital Loss: {taxInfo.capitalLoss}</p>
                <p>BTC currently in possession: {taxInfo.totalBTC}, Average Cost of BTC:  {taxInfo.avgBTC}</p>
                <p>ETH currently in possession: {taxInfo.totalETH}, Average Cost of ETH:  {taxInfo.avgETH} </p>
                <p>CAD sent: {taxInfo.CADSent} </p>
                <p>CAD Received: {taxInfo.CADReceived} </p>
            </div>
            <div id = "re-submit">
                <button type="button" class="btn btn-success btn-block" onClick={() => Resubmit(wallet, columns, data, setColumns, setData, setTaxInfo)}>Resubmit</button>
            </div>
        </div>
    }
    return (
        <div>
            <input type="file" name="file" onChange={event => setSelectedFile(event.target.files[0])} />
            <input type="text" name="wallet" onChange={event => setWallet(event.target.value)}/>
            <button type="button" class="btn btn-success btn-block" onClick={() => Upload(selectedFile, wallet, setColumns, setData, setTaxInfo)}>Upload</button>
            {table}
        </div>
    )
}

function Resubmit(wallet, columns, data, setColumns, setData, setTaxInfo){
    const payload = new FormData()
    payload.append('wallet', wallet)
    const columnsNames = []
    for (const column in columns){
        columnsNames.push(columns[column].field)
    }
    payload.append('columns', JSON.stringify(columnsNames))
    const rows = []
    for (const row in data){
        const entry = {
            'Transaction Type': data[row]['Transaction Type'],
            'Date': data[row]['Date'],
            'Amount Debited': data[row]['Amount Debited'],
            'Debit Currency': data[row]['Debit Currency'],
            'Amount Credited': data[row]['Amount Credited'],
            'Credit Currency': data[row]['Credit Currency'],
            'Buy/Sell rate': data[row]['Buy/Sell rate'],
            'Credit/Debit': data[row]['Credit/Debit'],
            'Spot Rate': data[row]['Spot Rate'],
            'Address': data[row]['Address'],
            'Blockchain Transaction ID': data[row]['Blockchain Transaction ID'],
            'Taken From': data[row]['Taken From']
        }
        rows.push(entry)
    }
    payload.append('data', JSON.stringify(rows))
    axios.post("http://localhost:5000/resubmit", payload, {
        }).then(res => {
            console.log("asd")
        })
}
function Upload(selectedFile, wallet, setColumns, setData, setTaxInfo){
    const payload = new FormData()
    payload.append('file', selectedFile)
    payload.append('wallet', wallet)
    axios.post("http://localhost:5000/upload", payload, {
        }).then(res => {
                CreateTable(res.data.table ,res.data.columns, setColumns, setData)
                setTaxInfo({
                    incomeGain: res.data.info.incomeGain,
                    capitalLoss: res.data.info.capitalLoss,
                    capitalGain: res.data.info.capitalGain,
                    totalBTC: res.data.info.totalBTC,
                    totalETH: res.data.info.totalETH,
                    totalCAD: res.data.info.totalCAD,
                    CADSent: res.data.info.CADSent,
                    CADReceived: res.data.info.CADReceived,
                    avgBTC: res.data.info.avgBTC,
                    avgETH: res.data.info.avgETH})
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
