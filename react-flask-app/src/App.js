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
import 'bootstrap/dist/css/bootstrap.min.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme) => ({
    root : {
        width: '100%',
    },
    button: {
        marginRight: theme.spacing(1),
        color: '#F7F7F7',
        background: 'black',
        textTransform: 'capitalize',
        "&:hover": {
            backgroundColor: 'black',
        }
    },
    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}));


function CreateTable(rows ,columns, setColumns, setData){
    setColumns(columns);
    setData(rows)
}
function displayFileName(name){
    var displayLocation = document.getElementById('selectedFile');
    displayLocation.innerHTML = "Selected File: " + name;
}
function UserInput(){
    const [selectedFile, setSelectedFile] = useState(null)
    const [shakepayWallet, setShakepayWallet] = useState(null)
    const [wallet, setWallet] = useState(null)
    const [columns, setColumns] = useState([])
    const [data, setData] = useState([])
    const [taxInfo, setTaxInfo] = useState({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    let table;

    const classes = useStyles();
    const [page, setPage] = useState(0);
    const [rowPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value); // + in front mean return the numeric representation of object
        setPage(0);
    };
    if (columns.length === 0 && data.length === 0){
        table =
        <div class = "content">
            <Grid container spacing={3} justify="center"   direction="column"
                alignItems="center" style={{ minHeight: '100vh' }}>
                <Grid item xs={6}>
                    Shakepay csv file:&nbsp;
                    <Button
                        className = {classes.button}
                        variant = "contained"
                        component = "label"
                    >
                        Choose File
                        <input
                            id = "fileInput"
                            type = "file"
                            onChange={event => {
                                setSelectedFile(event.target.files[0]);
                                displayFileName(event.target.files[0].name);
                            }}
                            hidden
                        />
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <div id = "selectedFile">Selected File: </div>
                </Grid>
                <Grid item xs={6}>
                    <Button className = {classes.button} variant="contained" color= "primary" onClick={() => Upload(selectedFile, wallet, shakepayWallet,setColumns, setData, setTaxInfo, setLoading, setShakepayWallet, setError)}>Upload </Button>
                </Grid>
                <Grid item xs={6}>
                    <h4> Optional </h4>
                </Grid>
                <Grid Item xs={6}>
                    <p>
                        Non-shakepay ethereum data will not be 100% accurate due to limited historical price data available on Coingecko.
                    </p>
                </Grid>
                <Grid item xs={6}>
                    Shakepay Ethereum Wallet: <input type="text" name="shakepayWallet" onChange={event => setShakepayWallet(event.target.value)} />
                </Grid>
                <Grid item xs={6}>
                    non-Shakepay Ethereum Wallet: <input type="text" name="wallet" onChange={(event) => { const value = event.target.value;
                    setWallet(event.target.value);}}/>
                </Grid>
                <Grid item xs={6}>
                    {loading ? <CircularProgress /> : ""}
                    {error ? "Please upload a csv file from shakepay" : ""}
                </Grid>
            </Grid>
        </div>
    }
    else{
        table =
        <div class = "content">
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
        <Container maxWidth= "false" >
            {table}
        </Container>
    )
}

function Upload(selectedFile, wallet, shakepayWallet ,setColumns, setData, setTaxInfo,setLoading, setShakepayWallet, setError){
    if(selectedFile == null){
        setError(true)
        setLoading(false)
    }
    else{
        setError(false)
        setLoading(true)
        const payload = new FormData()
        payload.append('file', selectedFile)
        payload.append('wallet', wallet)
        payload.append('shakepayWallet', shakepayWallet)
        axios.post("http://crypto-tax-shakepay.herokuapp.com/upload", payload, {
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
}
class App extends Component {

    render(){

        return (
        <Container maxWidth= "false" >
            <h1> Crypto Bro Tax</h1>
            <h3> Ethereum Tax calculator for Shakepay</h3>
            <UserInput/>
        </Container>
    );}

}

export default App;
