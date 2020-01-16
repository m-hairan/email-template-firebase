import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import { createDrawerNavigator } from 'react-navigation-drawer'
import normalize from './src/helpers/sizeHelper'

import CheckAuth from './src/screens/checkAuth'
import Menu from './src/screens/menu'

import Login from './src/screens/auth/login'
import SignUp from './src/screens/auth/signup'
import WelcomeNew from './src/screens/auth/welcomeNew'
import ForgotPassword from './src/screens/auth/forgotPassword'


import Dashboard from './src/screens/dashboard'
import Grade from './src/screens/grade'
import Video from './src/screens/video'
import Profile from './src/screens/profile'
import Payment from './src/screens/payment'
import GradeSelection from './src/screens/payment/gradeSelection'


const PreStack = {
  CheckAuth: { screen: CheckAuth }
}

const AuthStack = {
  Login: { screen: Login },
  SignUp: { screen: SignUp },
  ForgotPassword: {screen: ForgotPassword},
  WelcomeNew: { screen: WelcomeNew }
}

const MainStack = {
  Dashboard: { screen: Dashboard },
  Grade: { screen: Grade },
  Video: { screen: Video },
  Profile: { screen: Profile },
  GradeSelection: { screen: GradeSelection },
  Payment: { screen: Payment }
}

const DrawerStack = createDrawerNavigator(MainStack, {
  drawerWidth: normalize(300),
  contentComponent: Menu
})

const AppNavigator = createStackNavigator({
  ...PreStack,
  ...AuthStack,

  Drawer: {
    name: 'Drawer',
    screen: DrawerStack,
  },
}, {
    mode: 'modal',
    headerMode: 'none',
})


const Navigation = createAppContainer(AppNavigator);

const mapDispatchToProps = (dispatch) => {
  return ({
  })
}

const mapStateToProps = (state) => {
  return ({
  })
}

class Router extends React.Component {
  render() {
    return (
      <Navigation />
    )
  }

}


export default connect(mapStateToProps, mapDispatchToProps)(Router)
