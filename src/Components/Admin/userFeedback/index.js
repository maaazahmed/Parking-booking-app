import React, { Component } from 'react';
import './index.css';
import Header from "../../AppBar/index"
import firebase from "firebase";
import { connect } from "react-redux"
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import StarIcon from '@material-ui/icons/Star';
import {
    FeedbackAction,
    FeedbackActionEmpty,
    EmptyParkingList,
    FeedbackValAction,
    FeedbacReplyAction,
    FeedbacReplyActionEmty
} from "../../../store/action/action"




let database = firebase.database().ref("/")
class UserFeedback extends Component {
    constructor() {
        super()
        this.state = {
            currentUser: "",
            feedbackVal: "",
            ReplyText: "",
            open: false
        }
    }



    componentWillMount() {
        database.child("Feedback").on("child_added", (snap) => {
            let obj = snap.val()
            obj.id = snap.key
            // console.log(obj)
            this.props.FeedbackAction(obj)
        })

        database.child("feedbackreply").on("child_added", (snap) => {
            let obj_2 = snap.val()
            obj_2.id = snap.key
            console.log(obj_2)
            this.props.FeedbacReplyAction(obj_2)
        })
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                database.child(`user/${user.uid}`).on("value", (snap) => {
                    let obj = snap.val()
                    obj.id = snap.key
                    this.setState({ currentUser: obj })
                })
            }
        });
    }

    componentWillUnmount() {
        this.props.FeedbackActionEmpty()
        this.props.FeedbacReplyActionEmty()
    }

    onChangeReplyText(ev) {
        this.setState({
            [ev.target.name]: ev.target.value
        })
    }
    handleOpen = (val) => {
        this.props.FeedbackValAction(val)
        this.setState({
            open: true
        })
    }



    ReplyTextSubmit() {
        let ReplyText = this.state.ReplyText;
        let username = this.state.currentUser.username
        if (ReplyText == "") {
            alert("Please Write somthing")
        }
        else {
            let feedbackId = this.props.FeedbackValue.feedbackValObj.id
            let ReplyTextObj = {
                ReplyText,
                feedbackId,
                username
            }
            database.child(`feedbackreply`).push(ReplyTextObj)
            this.setState({
                ReplyText: "",
                open: false
            })

        }
    }

    render() {
        let replyList = this.props.ReplyList.replyList
        return (
            <div className="App">
                <div>
                    <Header />
                </div>
                <br /><br /><br /><br /><br />
                {this.props.feedList.feedback.map((val, ind) => {
                    return (
                        <div key={ind}>
                            <Card className="user_feedback_card" >
                                <CardContent>
                                    <div className="username-div" >
                                        {val.username}
                                    </div>

                                    <Typography component="p">
                                        {val.feedback}
                                    </Typography>
                                </CardContent>
                                <CardActions style={{ justifyContent: "flex-end" }} >
                                    <Button onClick={this.handleOpen.bind(this, val)} color="primary" >
                                        Reply
                                    </Button>
                                </CardActions>
                                <hr />
                                <div>
                                    {replyList.map((replys, index) => {
                                        return (
                                            (replys.feedbackId === val.id) ?
                                                <div key={index}>
                                                    <List component="nav">
                                                            <ListItem>
                                                                <div style={{ fontWeight: "bold", color: "#3f51b5" }}>
                                                                    {replys.username}
                                                                </div>
                                                            </ListItem>
                                                            <ListItem>
                                                                <div>
                                                                    {replys.ReplyText}
                                                                </div>
                                                            </ListItem>
                                                        </List>
                                                </div>
                                                : null
                                        )
                                    })}
                                </div>
                            </Card>
                        </div>
                    )
                })}
                <div>
                    <Dialog
                        className="DialogBox"
                        open={this.state.open}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description">
                        <DialogTitle id="alert-dialog-title">{" Create Parking Area"}</DialogTitle>
                        <DialogContent>
                            <FormControl style={{ width: "100%", }}  >
                                <InputLabel htmlFor="adornment-Area">Parking Area</InputLabel>
                                <Input
                                    id="adornment-Area"
                                    type={'text'}
                                    value={this.state.ReplyText}
                                    onChange={this.onChangeReplyText.bind(this)}
                                    multiline={true}
                                    name="ReplyText" />
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleClose} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={this.ReplyTextSubmit.bind(this)} color="primary" autoFocus>
                                ok
                           </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        );
    }
}

const mapStateToProp = (state) => {
    return ({
        feedList: state.root,
        FeedbackValue: state.root,
        ReplyList: state.root,

    });
};
const mapDispatchToProp = (dispatch) => {
    return {
        FeedbackAction: (data) => {
            dispatch(FeedbackAction(data))
        },

        FeedbackActionEmpty: () => {
            dispatch(FeedbackActionEmpty())
        },
        EmptyParkingList: () => {
            dispatch(EmptyParkingList())
        },
        FeedbackValAction: (data) => {
            dispatch(FeedbackValAction(data))
        },
        FeedbacReplyAction: (data) => {
            dispatch(FeedbacReplyAction(data))
        },
        FeedbacReplyActionEmty: () => {
            dispatch(FeedbacReplyActionEmty())
        },
    };
};



export default connect(mapStateToProp, mapDispatchToProp)(UserFeedback)

