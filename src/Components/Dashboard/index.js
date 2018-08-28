import React, { Component } from 'react';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import history from "../../History"
import "./index.css"
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import firebase from "firebase"
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { connect } from "react-redux"
import TextField from '@material-ui/core/TextField';
import Header from "../AppBar/index"
import {
    ParkingAction,
    Parking_ID,
    slotsAction,
    selectedData,
    AreaNameAction,
    currentUserData,
    ParkingTime,
    ParkingTimeEmpty,
    EmptyParkingList,
    slots_List,
    SlotsArrAction
} from "../../store/action/action"


// let arr = [] 
const database = firebase.database().ref("/")
class Dashboard extends Component {
    constructor() {
        super()
        this.state = {
            open: false,
            open2: false,
            anchorEl: null,
            numberOfSlots: "",
            parkingAreaVal: "",
            num: 0,
            startTime: "",
            endTime: "",
            localSlot: {},
            isLoader: false,
            currentUserID: "",
            isSlotLoder: false
        }
    }
    componentWillMount() {
        let checkAouth = localStorage.getItem("token")
        if (checkAouth == null) {
            history.push("/");
        }
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({ currentUserID: user.uid })
                database.child(`user/${user.uid}`).on("value", (snapshot) => {
                    let user = snapshot.val()
                    user.id = snapshot.key
                })
            }
        });


        database.child(`AllParking`).on("child_added", (snapshot) => {
            let obj_2 = snapshot.val();
            obj_2.id = snapshot.key;
            this.props.ParkingTime(obj_2)
        })
    }
    componentDidMount() {
        database.child("Parkings").on("child_added", (snapshot) => {
            let obj = snapshot.val();
            obj.id = snapshot.key;
            this.props.ParkingAction(obj)
        })
    }

    handleOn_Change(ev) {
        this.setState({
            [ev.target.name]: ev.target.value
        })
    }
    handleClickOpen2 = () => {
        this.setState({ open2: true });
    };
    handleClose2 = () => {
        this.setState({ open2: false });
        this.props.AreaNameAction("")
        this.props.slots_List([])
    };
    componentWillUnmount() {
        this.props.ParkingTimeEmpty()
        this.props.EmptyParkingList()
    }

    bookingCuntineu() {
        let startTime = new Date(this.state.startTime).getTime()
        let endTime = new Date(this.state.endTime).getTime()
        let parking_Data = this.props.Parking_Time.parkingTime
        let parkinID = this.props.parkinID.parkinID;
        this.props.slots_List([])
        if (endTime <= startTime || startTime <= new Date().getTime()) {
            alert("Please select correct time")
        }

        else {
            if (this.props.Parking_Time.parkingTime.length < 1) {
                this.setState({ isSlotLoder: true })
                // console.log("http://localhost:3000/Dashboard")
            }
            else {
                this.setState({ isSlotLoder: true })
                for (let i = 0; i < this.props.Parking_Time.parkingTime.length; i++) {
                    if ((startTime <= parking_Data[i].startTime && endTime > parking_Data[i].startTime && parking_Data[i].parkinID === parkinID)
                        ||
                        (startTime >= parking_Data[i].startTime && startTime < parking_Data[i].endTime && parking_Data[i].parkinID === parkinID)) {
                        database.child(`Parkings/${parking_Data[i].parkinID}/bookingArr/${parking_Data[i].index}`).set(parking_Data[i])
                    }
                    else {
                        database.child(`Parkings/${parking_Data[i].parkinID}/bookingArr/${parking_Data[i].index}`).set({ active: false, index: i })
                    }
                }
            }
            let slotArr = []
                // let slotArr = this.props.slotsArr.slotsArry.bookingArr
                database.child(`Parkings/${parkinID}/bookingArr`).on("child_added", (snapshot) => {
                    let obj = snapshot.val()
                    obj.id = snapshot.key;
                    slotArr.push(obj)
                })
                setTimeout(() => {
                    this.setState({ isSlotLoder: false })
                    this.setState({ num: this.props.slotList.slotsList.length })
                    this.props.slots_List(slotArr)
                }, 2000)
            this.setState({ open2: false });
        }
    }

    selectSlot(data, index) {
        let parkinID = this.props.parkinID.parkinID;
        let slotObj = {
            parkinID: parkinID,
            index: index,
            areaName: this.props.areaName.areaName,
            sloteNumber: index + 1
        }
        let timeObj = {
            startTime: new Date(this.state.startTime).getTime(),
            endTime: new Date(this.state.endTime).getTime(),
            parkinID: parkinID,
            index: index,
            areaName: this.props.areaName.areaName,
            currentUserID: this.state.currentUserID,
            sloteNumber: index + 1
        }
        database.child(`Parkings/${parkinID}/bookingArr/${index}`).set(slotObj)
        database.child(`AllParking/`).push(timeObj)
        this.props.slots_List([])
        this.props.AreaNameAction("")
        history.push("/ViweBooking")
    }

    cancleSlots() {
        this.props.AreaNameAction("")
        this.props.slots_List([])
    }

    selectTime(data) {
        this.props.Parking_ID(data.id)
        this.props.AreaNameAction(data.parkingAreaVal)
        this.props.SlotsArrAction(data)
        this.setState({ open2: true });
    }




    render() {
        let parkingList = this.props.ParkingList.parkingList;
        let parkinID = this.props.parkinID.parkinID;
        let startTime = new Date(this.state.startTime).getTime();
        let endTime = new Date(this.state.endTime).getTime();
        return (
            <div className="App">
                <Header heading="Dashboard" />

                <div>
                    <Dialog
                        className="DialogBox"
                        open={this.state.open2}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description">
                        <DialogTitle id="alert-dialog-title">{" Create Parking Area"}</DialogTitle>
                        <DialogContent>
                            <div>
                                <TextField
                                    style={{ width: "100%" }}
                                    id="datetime-local"
                                    label="Start time"
                                    type="datetime-local"
                                    placeholder="Start time"
                                    name="startTime"
                                    value={this.state.startTime}
                                    onChange={this.handleOn_Change.bind(this)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        step: 300,
                                    }}
                                />
                            </div>
                            <div style={{ marginTop: "6%" }} >
                                <TextField
                                    style={{ width: "100%" }}
                                    id="datetime-local"
                                    label="End time"
                                    type="datetime-local"
                                    placeholder="Start time"
                                    name="endTime"
                                    value={this.state.endTime}
                                    onChange={this.handleOn_Change.bind(this)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        step: 300,
                                    }}
                                />
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={this.handleClose2}
                                color="primary">
                                Cancel
                            </Button>
                            <Button
                                onClick={this.bookingCuntineu.bind(this)}
                                color="primary" autoFocus>
                                Book
                           </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div className="content" >
                    <div className="content_div_1" >
                        <div className="scrollbar" id="style-3">
                            <div className="force-overflow">
                                <div>
                                    {parkingList.map((val, ind) => {
                                        return (
                                            <List key={ind}>
                                                <ListItem>
                                                    <ListItemAvatar>
                                                        <Avatar
                                                            alt="Adelle Charles"
                                                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxUrqjMcRAeCvrllU5EjZ6dU3T3FKcGaJyM7Y2a3qJP2YX4wAf">
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText>
                                                        <div className="Parking_area_List" >{val.parkingAreaVal}</div>
                                                        <div className="parkingSlotList" >{val.numberOfSlots} slots</div>
                                                    </ListItemText>

                                                    <ListItemSecondaryAction>
                                                        <IconButton
                                                            onClick={this.selectTime.bind(this, val)} aria-label="Delete">
                                                            <svg fill="#fff" xmlns="http://www.w3.org/2000/svg"
                                                                width="40" height="40" viewBox="0 0 24 24">
                                                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                                                <path d="M0 0h24v24H0z" fill="none" />
                                                            </svg>
                                                        </IconButton>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            </List>
                                        )
                                    })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="content_div_2">
                        {(this.props.areaName.areaName === "") ? null :
                            <div className="areaNameHeader" >
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
                                    {this.props.areaName.areaName}
                                </div>
                                <div>
                                    <IconButton
                                        style={{ display: "flex", alignItems: "center" }} >
                                        <svg onClick={this.cancleSlots.bind(this)} fill="#3f51b5" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24">
                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                            <path d="M0 0h24v24H0z" fill="none" />
                                        </svg>
                                    </IconButton>
                                </div>
                            </div>}
                        <div className="scrollbar_2" id="style-4">
                            <div className="force-overflow">

                                {(this.props.areaName.areaName === "") ?
                                    <div className="Nothing_to_show_div" >
                                        <div className="Nothing_to_show_text" >
                                            Please select location
                                          </div>
                                    </div>
                                    : null}
                                <div className="slote_CardContent" >
                                    {this.props.slotList.slotsList.map((value, index) => {
                                        return (
                                            <Card
                                                style={
                                                    ((startTime <= value.startTime && endTime > value.startTime && value.parkinID === parkinID)
                                                        ||
                                                        (startTime >= value.startTime && startTime < value.endTime && value.parkinID === parkinID)) ?
                                                        { backgroundColor: "#3f51b5" }
                                                        :
                                                        { backgroundColor: "#fff" }
                                                }
                                                key={index}
                                                onClick={
                                                    ((startTime <= value.startTime && endTime > value.startTime && value.parkinID === parkinID)
                                                        ||
                                                        (startTime >= value.startTime && startTime < value.endTime && value.parkinID === parkinID)) ?
                                                        null
                                                        :
                                                        this.selectSlot.bind(this, value, index)
                                                }
                                                className={
                                                    ((startTime <= value.startTime && endTime > value.startTime && value.parkinID === parkinID)
                                                        ||
                                                        (startTime >= value.startTime && startTime < value.endTime && value.parkinID === parkinID)) ?
                                                        "slots_button2" : "slots_button"}>
                                                <CardContent>
                                                    {
                                                        ((startTime <= value.startTime && endTime > value.startTime && value.parkinID === parkinID)
                                                            ||
                                                            (startTime >= value.startTime && startTime < value.endTime && value.parkinID === parkinID)) ?
                                                            <div>selected</div>
                                                            :
                                                            <div> slot {index + 1}</div>
                                                    }
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                                {(this.state.isSlotLoder) ?
                                    <div className="adjust">
                                        <div className="loader"></div>
                                    </div>
                                    : null}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}



const mapStateToProp = (state) => {
    return ({
        ParkingList: state.root,
        parkinID: state.root,
        allSlots: state.root,
        selected_Data: state.root,
        areaName: state.root,
        user: state.root,
        Parking_Time: state.root,
        slotList: state.root,
        slotsArr: state.root,

    });
};
const mapDispatchToProp = (dispatch) => {
    return {
        ParkingAction: (data) => {
            dispatch(ParkingAction(data))
        },
        Parking_ID: (data) => {
            dispatch(Parking_ID(data))
        },
        // slotsAction: (data) => {
        //     dispatch(slotsAction(data))
        // },
        selectedData: (data) => {
            dispatch(selectedData(data))
        },
        AreaNameAction: (data) => {
            dispatch(AreaNameAction(data))
        },
        currentUserData: (data) => {
            dispatch(currentUserData(data))
        },
        ParkingTime: (data) => {
            dispatch(ParkingTime(data))
        },
        ParkingTimeEmpty: (data) => {
            dispatch(ParkingTimeEmpty(data))
        },
        EmptyParkingList: (data) => {
            dispatch(EmptyParkingList(data))
        },
        slots_List: (data) => {
            dispatch(slots_List(data))
        },

        SlotsArrAction: (data) => {
            dispatch(SlotsArrAction(data))
        },


    };
};

export default connect(mapStateToProp, mapDispatchToProp)(Dashboard)

