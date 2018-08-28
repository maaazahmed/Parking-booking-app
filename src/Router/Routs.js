import React, { Component } from 'react';
import { Router, Route } from "react-router-dom"
import {
    CreateAccount,
    LogIn,
    Dashboard,
    ViweBooking,
    AdminComponent,
    AllParkins,
    Users,
    Feedback,
    UserFeedback,
    Createparking
} from "../Components/index"
import history from "../History"
import firebase from "firebase";

//  const Main = ()=>{
//     let checkAouth = localStorage.getItem("token")
//     if (checkAouth == null) {
//         return history.push("/logIn");
//     }
//     // else{
//     //     return history.push("/Dashboard");
//     // }
//  }



const database = firebase.database().ref("/")
class Routers extends Component {
    constructor() {
        super()
        this.state = {
            currentUser: ""
        }
    }
    componentWillMount() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                database.child(`user/${user.uid}`).on("value", (snapshot) => {
                    let user = snapshot.val()
                    user.id = snapshot.key
                    this.setState({ currentUser: user })
                })
            }
        });
    }

    render() {
        return (
            <div>
                <Router history={history} >
                    <div>
                        <Route exact path="/" component={LogIn} />
                        <Route path="/CreateAccount" component={CreateAccount} />
                        <Route path={"/Dashboard"} component={(this.state.currentUser.accountType === "admin") ? Createparking : Dashboard} />
                        <Route path="/ViweBooking" component={ViweBooking} />
                        <Route path="/Admin" component={AdminComponent} />
                        <Route path="/AllParkins" component={AllParkins} />
                        <Route path="/Users" component={Users} />
                        <Route path="/Feedback" component={Feedback} />
                        <Route path="/UserFeedback" component={UserFeedback} />
                    </div>
                </Router>
            </div>
        );
    }
}

export default Routers;
