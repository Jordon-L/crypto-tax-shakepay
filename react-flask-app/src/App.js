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
import TableFooter from '@material-ui/core/TableFooter';
import Paper from '@material-ui/core/Paper';
import 'bootstrap/dist/css/bootstrap.min.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import { CSVLink } from "react-csv";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme) => ({
    root : {
        width: '100%',
    },
    button: {
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
    grid:{
        [theme.breakpoints.down('sm')]:{
            width: '100%'
        },
    },
    inputCard :{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',

        [theme.breakpoints.up('md')]:{
            width: '960px'
        },
        [theme.breakpoints.down('sm')]:{
            width: '100%'
        },
    },
    inputCardAction :{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    table : {
        width: '1500px'
    },
    disabledAccordion: {
        backgroundColor : '#fff !important',
    },
    disabledAccordionSummary: {
        opacity : '1 !important'
    },
}));


function CreateTable(rows ,columns, setColumns, setData){
    setColumns(columns);
    setData(rows);
}
function displayFileName(name){
    var displayLocation = document.getElementById('selectedFile');
    displayLocation.innerHTML = "Selected File: " + name;
}
function TableDialog(props){
        const { openTable, onCloseTable, data, columns } = props;
    const classes = useStyles();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value); // + in front mean return the numeric representation of object
        setPage(0);
    };
    return (
        <Dialog
            onClose={onCloseTable}
            maxWidth = '1500px'
            open={openTable}
        >
            <DialogTitle id="simple-dialog-title">Transaction Table</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Shakingsats is not displayed, but is calculated as Income
                </DialogContentText>

               <CSVLink
                      data={data}
                      filename={"transactionTable.csv"}
                    >
                <Button className = {classes.button}
                variant = "contained"
                component = "label"
                >
                    Download
                </Button>
                </CSVLink>


                <TableContainer className = {classes.table}>
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
                            {(rowsPerPage > 0
                                ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : data
                            ).map((row) => {
                                return(
                                    <TableRow>
                                        {columns.map((column) => {
                                            const value = row[column.field]
                                            return (
                                                <TableCell key = {column.title}>
                                                    {value}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    rowsPerPageOptions = {[10,25, { label: 'All', value: -1 }]}
                                    count = {data.length}
                                    rowsPerPage = {rowsPerPage}
                                    page = {page}
                                    onChangePage = {handleChangePage}
                                    onChangeRowsPerPage = {handleChangeRowsPerPage}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </DialogContent>
        </Dialog>
    )

}
function MoreDetailDialog(props){
    const { openDetail, onCloseDetail, taxInfo} = props;

    return (
        <Dialog
            onClose={onCloseDetail}
            maxWidth = '1500px'
            open={openDetail}
        >
            <DialogTitle>Breakdown of Capital Gain</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {taxInfo.capitalGain}
                </DialogContentText>
            </DialogContent>
        </Dialog>
    )
}

function UserInput(){
    const [selectedFile, setSelectedFile] = useState(null);
    const [shakepayWallet, setShakepayWallet] = useState(null);
    const [year, setYear] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    const [taxData, setTaxData] = useState([]);
    const [taxColumns, setTaxColumns] = useState([]);
    const [taxInfo, setTaxInfo] = useState({});
    const [displayTable, setDisplayTable] = useState(false);
    const [displayCapital, setDisplayCapital] = useState(false);
    const [displayIncome, setDisplayIncome] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorFile, setErrorFile] = useState(false);
    const [openTable, setOpenTable] = React.useState(false);
    const [openDetail, setOpenDetail] = React.useState(false);
    const [errorEth, setErrorEth] = React.useState(false);
    let table;

    const classes = useStyles();
    //const [page, setPage] = useState(0);
    //const [rowsPerPage, setRowsPerPage] = useState(10);
    //const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
    //const handleChangePage = (event, newPage) => {
    //    setPage(newPage);
    //};

    //const handleChangeRowsPerPage = (event) => {
    //    setRowsPerPage(+event.target.value); // + in front mean return the numeric representation of object
     //   setPage(0);
    //};
    // open table
    const handleClickOpenTable = () => {
        setOpenTable(true);
    };

    const handleCloseTable = () => {
        setOpenTable(false);
    };

    const handleClickOpenDetail = () => {
        setOpenDetail(true);
    };
    const handleCloseDetail = () => {
        setOpenDetail(false);
    };
    if (columns.length === 0 && data.length === 0){
        table =
        <div class = "content">
            <Grid container justify="center" direction="column"
                alignItems="center">
                <Grid item xs={12} className = {classes.grid}>
                    <Card>
                        <CardContent className= {classes.inputCard}>
                             <CardActions className={classes.inputCardAction}>
                                Year: <input type="text" name="year" onChange={event => setYear(event.target.value)} />
                            </CardActions>
                            <Typography>
                                Shakepay csv file:
                            </Typography>
                            <CardActions className= {classes.inputCardAction}>
                                <Button className = {classes.button}
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
                            </CardActions>
                            <Typography>
                                <div id = "selectedFile">Selected File: </div>
                            </Typography>
                            <CardActions className={classes.inputCardAction}>
                                <Button className = {classes.button} variant="contained" color= "primary" onClick={() =>
                                Upload(selectedFile, wallet, shakepayWallet,setColumns, setData, setTaxInfo, setLoading, setShakepayWallet, setError, year, setErrorEth, setErrorFile)}>Upload </Button>
                            </CardActions>
                            <Typography>
                                <h4> Optional </h4>
                            </Typography>
                                Non-shakepay ethereum data will not be 100% accurate due to limited historical price data available on Coingecko.
                            <CardActions className={classes.inputCardAction}>
                                Shakepay Ethereum Wallet: <input type="text" name="shakepayWallet" onChange={event => setShakepayWallet(event.target.value)} />
                            </CardActions>
                            <CardActions className={classes.inputCardAction}>
                                non-Shakepay Ethereum Wallets (comma separated): <input type="text" name="wallet" onChange={(event) => { const value = event.target.value;
                                setWallet(event.target.value);}}/>
                            </CardActions>
                            <Typography>
                                {loading ? <CircularProgress /> : ""}
                                {error ? "No csv selected or year is empty" : ""}
                                {errorFile ? "Format incorrect in csv" : ""}
                                {errorEth ? "Fill in Shakepay Wallet address" : ""}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    }
    else{
        table =
        <div class = "content">
            <Grid container justify="center" direction="column"
                alignItems="center">
                <Grid item xs={12} className = {classes.grid}>
                    <Card className = {classes.inputCard}>
                        <CardContent>
                            <div>
                                <Accordion disabled className = {classes.disabledAccordion}>
                                    <AccordionSummary
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                    className = {classes.disabledAccordionSummary}
                                    >
                                        <Typography>
                                            Income: {taxInfo.incomeGain}
                                        </Typography>
                                     </AccordionSummary>
                                </Accordion>
                                <Accordion>
                                    <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel2a-content"
                                    id="panel2a-header"
                                    >
                                        <Typography>
                                            Capital gain: {taxInfo.capitalGain}
                                        </Typography>
                                     </AccordionSummary>
                                     <AccordionDetails>
                                        <Typography>
                                            test
                                        </Typography>
                                     </AccordionDetails>
                                </Accordion>
                               <Accordion disabled className = {classes.disabledAccordion}>
                                    <AccordionSummary
                                    aria-controls="panel3a-content"
                                    id="panel3a-header"
                                    className = {classes.disabledAccordionSummary}
                                    >
                                        <Typography>
                                            Taxable Income: {+taxInfo.incomeGain + +taxInfo.capitalGain * 0.5}
                                        </Typography>
                                     </AccordionSummary>
                                </Accordion>
                            </div>
                            <CardActions className={classes.inputCardAction}>
                                <Button className = {classes.button} variant="contained" color= "primary" onClick={handleClickOpenDetail} >Show more details </Button>
                            </CardActions>
                            <CardActions className={classes.inputCardAction}>
                                <Button className = {classes.button} variant="contained" color= "primary" onClick={handleClickOpenTable}  >Display transaction table </Button>
                            </CardActions>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} id = "displayTableButton" >

                </Grid>
            </Grid>
            <TableDialog openTable = {openTable} onCloseTable = {handleCloseTable} data = {data} columns = {columns} />
            <MoreDetailDialog openDetail = {openDetail} onCloseDetail = {handleCloseDetail} taxInfo = {taxInfo} />
        </div>
    }
    return (
        <Container disableGutters maxWidth= "false" >
            {table}
        </Container>
    )
}

function Upload(selectedFile, wallet, shakepayWallet ,setColumns, setData, setTaxInfo,setLoading, setShakepayWallet, setError, year, setErrorEth, setErrorFile){
    if(selectedFile == null || year == null){
        setError(true)
        setLoading(false)
    }
    else if((wallet != null && shakepayWallet == null) || (wallet != null && shakepayWallet == "") ){
        setErrorEth(true)
        setLoading(false)
    }
    else{
        setError(false)
        setErrorEth(false)
        setLoading(true)
        const payload = new FormData()
        payload.append('file', selectedFile)
        payload.append('wallet', wallet)
        payload.append('shakepayWallet', shakepayWallet)
        payload.append('year', year)
        console.log(year)
        axios.post("/upload", payload, {
            }).then(res => {
                    if(res.data.error == "true"){
                        setErrorFile(true)
                        setLoading(false)
                    }
                    else{
                        CreateTable(res.data.table ,res.data.columns, setColumns, setData)
                        const info = JSON.parse(res.data.info)
                        setTaxInfo({
                            incomeGain: info.incomeGain,
                            capitalGain: info.capitalGain,
                            totalNumberETH: info.totalNumberETH,
                            totalSalePriceETH: info.totalSalePriceETH,
                            totalCostETH: info.totalCostETH,
                            totalFeesETH: info.totalFeesETH,
                            totalGainsETH: info.totalGainsETH,
                            totalNumberBTC: info.totalNumberBTC,
                            totalSalePriceBTC: info.totalSalePriceBTC,
                            totalCostBTC: info.totalCostBTC,
                            totalFeesBTC: info.totalFeesBTC,
                            totalGainsBTC: info.totalGainsBTC
                            })
                    }
                })
    }
}
class App extends Component {

    render(){

        return (
        <Grid Container disableGutters maxWidth= "false" direction="column" alignItems="center" id = "website">
            <Grid item xs={12} id = "title">
                <h1> Crypto gains </h1>
                <h4> for Shakepay and Ethereum mining</h4>
            </Grid>
            <Grid item xs={12} id = "results">
                <UserInput/>
            </Grid>
        </Grid>
    );}

}

export default App;
