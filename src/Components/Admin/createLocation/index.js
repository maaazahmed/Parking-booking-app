import React, { Component } from 'react';
import './index.css';
import Header from "../../AppBar/index"
import firebase from "firebase";
import { connect } from "react-redux"
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import AddIcon from '@material-ui/icons/Add';
import {
    adminParkingAction,
    adminParkingActionEmpty
} from "../../../store/action/action"



let database = firebase.database().ref("/")
class Createparking extends Component {
    constructor() {
        super()
        this.state = {
            currentUserID: "",
            feedbackVal: "",
            parkingAreaVal: "",
            numberOfSlots: "",
            open: false
        }
    }


    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    handleOn_Change(ev) {
        this.setState({
            [ev.target.name]: ev.target.value
        })
    }

    creatParking() {
        let userID = firebase.auth().currentUser;
        database.child(`user/${userID.uid}`).on("value", (snapshot) => {
            let obj = snapshot.val()
            obj.id = snapshot.key
            let ParkingObj = {
                username: obj.username,
                currentUserID: obj.id,
                parkingAreaVal: this.state.parkingAreaVal,
                numberOfSlots: this.state.numberOfSlots,
                bookingArr: [],
            }

            ParkingObj.bookingArr = []
            for (var i = 0; i < Number(this.state.numberOfSlots); i++) {
                let bookingObj = { active: false, index: i, };
                ParkingObj.bookingArr.push(bookingObj);
            }
            database.child("Parkings").push(ParkingObj)
        })
        this.setState({ open: false });
    }
    componentDidMount() {
        database.child("Parkings").on("child_added", (snapshot) => {
            let obj = snapshot.val();
            obj.id = snapshot.key;
            this.props.adminParkingAction(obj)
        })
    }

    componentWillUnmount() {

    }



    deleteParking(data, index) {
        database.child(`Parkings/${data.id}`).remove()
    }


    render() {
        return (
            <div className="App">
                <div>
                    <Header />
                </div>
                <br />
                <br />
                <br />
                <div>
                    {this.props.parkinList.parkingList.map((val, ind) => {
                        return (
                            <div key={ind} >
                                <Card
                                    style={(ind % 2 === 0) ? { backgroundColor: "#f2f2f2" } : { backgroundColor: "#dadada" }}
                                    className="parkingCard" >
                                    <div>
                                        <div className="CardContent_div" >
                                            <div className="parkingAreaVal" >
                                                {val.parkingAreaVal}
                                            </div>
                                            <div className="numberOfSlots">
                                                Slots {val.numberOfSlots}
                                            </div>
                                            {/* <Button onClick={this.deleteParking.bind(this, val, ind)} color="secondary" >
                                                Delete
                                           </Button> */}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )
                    })}
                </div>
                <div>
                    <Dialog
                        className="DialogBox"
                        open={this.state.open}
                        onClose={this.handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description">
                        <DialogTitle id="alert-dialog-title">{" Create Parking Area"}</DialogTitle>
                        <DialogContent>
                            <FormControl style={{ width: "100%", }}  >
                                <InputLabel htmlFor="adornment-Area">Parking Area</InputLabel>
                                <Input
                                    id="adornment-Area"
                                    type={'text'}
                                    value={this.state.parkingAreaVal}
                                    onChange={this.handleOn_Change.bind(this)}
                                    name="parkingAreaVal" />
                            </FormControl>
                            <FormControl style={{ width: "100%", marginTop: "5%" }}  >
                                <InputLabel htmlFor="adornment-Slots">Number of Slots</InputLabel>
                                <Input
                                    id="adornment-Slots"
                                    type="number"
                                    value={this.state.numberOfSlots}
                                    onChange={this.handleOn_Change.bind(this)}
                                    name="numberOfSlots" />
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleClose} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={this.creatParking.bind(this)} color="primary" autoFocus>
                                Save
                           </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div className="AddButton">
                    <Button
                        onClick={this.handleClickOpen}
                        variant="fab"
                        color="primary"
                        aria-label="Add" >
                        <AddIcon />
                    </Button>
                </div>
            </div>
        );
    }
}

const mapStateToProp = (state) => {
    return ({
        parkinList: state.root
    });
};
const mapDispatchToProp = (dispatch) => {
    return {
        // FeedbackAction: (data) => {
        //     dispatch(FeedbackAction(data))
        // },

        adminParkingActionEmpty: () => {
            dispatch(adminParkingActionEmpty())
        },
        adminParkingAction: (data) => {
            dispatch(adminParkingAction(data))
        },

    };
};


export default connect(mapStateToProp, mapDispatchToProp)(Createparking)

