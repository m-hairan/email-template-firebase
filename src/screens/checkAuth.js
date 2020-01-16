import React from 'react'
import firebase from 'react-native-firebase'
import {View} from 'react-native'

class CheckAuth extends React.Component {
  componentWillMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.props.navigation.navigate(user ? 'WelcomeNew' : 'Login')
    })
  }

  render() {
    return(
      <View></View>
    )

  }

}

export default CheckAuth