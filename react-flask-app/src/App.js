import React, {Component, useState } from 'react'
import './App.css'
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
    root : {
        width: '100%',
    },
    container: {
        maxHeight: 440,
    },
});


function CreateTable(rows ,columns, setColumns, setData){
    setColumns(columns);
    setData(rows)
}

function UserInput(){
    const [selectedFile, setSelectedFile] = useState(null)
    const [wallet, setWallet] = useState(null)
    const [columns, setColumns] = useState([])
    const [data, setData] = useState([])
    const [taxInfo, setTaxInfo] = useState({})
    const [loading, setLoading] = useState(false)
    let table;
    const classes = useStyles();
    const [page, setPage] = useState(0);
    const [rowPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value) // + in front mean return the numeric representation of object
        setPage(0);
    };

    if (columns.length === 0 && data.length === 0){
        table =
        <div>
            <input type="file" name="file" onChange={event => setSelectedFile(event.target.files[0])} />
            <input type="text" name="wallet" onChange={event => setWallet(event.target.value)}/>
            <button type="button" class="btn btn-success btn-block" onClick={() => Upload(selectedFile, wallet, setColumns, setData, setTaxInfo, setLoading)}>Upload</button>
            {loading ? "Loading..." : ""}
        </div>
    }
    else{
        table =
        <div>
            <div id ="table">
                <Paper className = {classes.root}>
                    <TableContainer className = {classes.container}>
                        <Table stickyHeader aria-label = "transaction table">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell key = {column.title}>
                                            {column.field}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.slice(page * rowPerPage, page * rowPerPage + rowPerPage).map((row) => {
                                    return(
                                        <TableRow>
                                            {columns.map((column) => {
                                                const value = row[column.title]
                                                return (
                                                    <TableCell key = {column.title}>
                                                        {value}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions = {[10,25,100]}
                        component = "div"
                        count = {data.length}
                        rowsPerPage = {rowPerPage}
                        page = {page}
                        onChangePage = {handleChangePage}
                        onChangeRowsPerPage = {handleChangeRowsPerPage}
                    />
                </Paper>
            </div>
            <div id = "tax" >
                <p>Income Gain: {taxInfo.incomeGain}</p>
                <p>Capital Gain: {taxInfo.capitalGain}</p>
                <p>Capital Loss: {taxInfo.capitalLoss}</p>
                <p>BTC currently in possession: {taxInfo.totalBTC}, Average Cost of BTC:  {taxInfo.avgBTC}</p>
                <p>ETH currently in possession: {taxInfo.totalETH}, Average Cost of ETH:  {taxInfo.avgETH} </p>
                <p>CAD sent: {taxInfo.CADSent} </p>
                <p>CAD Received: {taxInfo.CADReceived} </p>
            </div>
        </div>
    }
    return (
        <div>
            {table}
        </div>
    )
}

function Upload(selectedFile, wallet, setColumns, setData, setTaxInfo,setLoading){
    setLoading(true)
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
