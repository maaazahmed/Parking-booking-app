import React, { Component } from 'react';
import './index.css';
import { connect } from "react-redux"
import { mySlotsAction, AreaNameAction, DeleteSlotAction } from "../../store/action/action"
import firebase from "firebase"
import Header from "../AppBar/index"
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

const database = firebase.database().ref("/")
class ViweBooking extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentUserID: "",
      endTime: ""
    }
  }



  componentWillMount(){
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        database.child(`AllParking`).on("child_added", (snapshot) => {
          let obj = snapshot.val();
          obj.id = snapshot.key;
          this.props.mySlotsAction(obj)
          // console.log(obj)
        })
        this.setState({ currentUserID: user.uid })
      }
    });
  }



  componentDidMount() {
    // this.props.selected_Data.mySlots.map((newVal, index) => {
    //   let slots = {
    //     active: false,
    //     index: newVal.index,
    //   }
    //   console.log(new Date(newVal.endTime).getTime() < new Date().getTime())
    //   if (new Date(newVal.endTime).getTime() < new Date().getTime()) {
    //     database.child(`AllParking/${newVal.id}`).remove()
    //     database.child(`Parkings/${newVal.parkinID}/bookingArr/${newVal.index}/`).set(slots)
    //   }
    // })
  }


  cancelSlot(val, ind) {
    let mySlots = this.props.selected_Data.mySlots
    let slots = {
      active: false,
      index: val.index,
    }
    database.child(`AllParking/${val.id}`).remove()
    database.child(`Parkings/${val.parkinID}/bookingArr/${val.index}/`).set(slots)
    let newSlots = mySlots.slice(0, ind).concat(mySlots.slice(ind + 1))
    this.props.DeleteSlotAction(newSlots)
  }

  render() {
    this.props.selected_Data.mySlots.map((newVal, index) => {
      let slots = {
        active: false,
        index: newVal.index,
      }
      if (new Date(newVal.endTime).getTime() < new Date().getTime()) {
        database.child(`AllParking/${newVal.id}`).remove()
        database.child(`Parkings/${newVal.parkinID}/bookingArr/${newVal.index}/`).set(slots)
      }
    })
    return (
      <div className="App">
        <div>
          <Header heading="View booking" />
        </div>
        <div >
          <br /><br /><br />
          {this.props.selected_Data.mySlots.map((val, ind) => {
            return (
              <div key={ind}>
                {(val.currentUserID === this.state.currentUserID) ?
                  <div>
                    <Card className="slots_button_list">
                      <CardContent
                        className="CardContent_class">
                        <div style={{ display: "flex", alignItems: "center" }} >{val.areaName}</div>
                        <div style={{ display: "flex", alignItems: "center" }} >Slote No {val.sloteNumber}</div>
                        <div style={{ display: "flex", alignItems: "center" }} >{new Date(val.startTime).toLocaleString()}</div>
                        <div style={{ display: "flex", alignItems: "center" }} >To</div>
                        <div style={{ display: "flex", alignItems: "center" }} >{new Date(val.endTime).toLocaleString()}</div>
                        <div>
                          <IconButton onClick={this.cancelSlot.bind(this, val, ind)} style={{ display: "flex", alignItems: "center" }} >
                            <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24">
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                              <path d="M0 0h24v24H0z" fill="none" />
                            </svg>
                          </IconButton>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  : null}
              </div>
            )
          })
          }
        </div>
      </div>
    );
  }
}

const mapStateToProp = (state) => {
  return ({
    selected_Data: state.root,
  });
};
const mapDispatchToProp = (dispatch) => {
  return {
    mySlotsAction: (data) => {
      dispatch(mySlotsAction(data))
    },
    AreaNameAction: (data) => {
      dispatch(AreaNameAction(data))
    },
    DeleteSlotAction: (data) => {
      dispatch(DeleteSlotAction(data))
    },

  };
};



export default connect(mapStateToProp, mapDispatchToProp)(ViweBooking)

