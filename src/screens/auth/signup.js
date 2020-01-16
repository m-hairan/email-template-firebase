import React from 'react'
import { StyleSheet, Text, View, ImageBackground, TextInput, Image, TouchableOpacity, Dimensions, TouchableWithoutFeedback, Keyboard, NativeModules } from 'react-native'
import { Button } from 'react-native-elements'
import firebase from 'react-native-firebase'
import normalize from '../../helpers/sizeHelper'
import Loading from '../loading'

const { height, width } = Dimensions.get('window')


class SignUp extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      email: '',
      password: '',
      repeatPassword: '',
      loading: false,
      errorMessage: null
    }
  }


  validate = async() => {
    let valid = true;

    const { email, password, repeatPassword } = this.state
    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if(email === ''){
      this.setState({errorMessage: 'Email is required!'})
      return false 
    }

    if(!regex.test(email)) {
      this.setState({errorMessage: 'Email is not correct format!'})
      return false 
    }

    if (password === '') {
      this.setState({errorMessage: 'Password is required!'})
      return false 
    }

    if (repeatPassword === '') {
      this.setState({errorMessage: 'Confirm password is required!'})
      return false 
    }

    if (password !== repeatPassword) {
      this.setState({errorMessage: 'Password is not matched!'})
      return false 
    }

    return true
  }

  handleSignUp = async () => {
    const { email, password } = this.state

    if (!await this.validate()) {
      return ;
    }

    try {
      this.setState({ loading: true });

      await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => this.props.navigation.navigate('Login'))
        .catch(error => this.setState({ errorMessage: error.message }))

      this.setState({ loading: false }); 
    } catch (error) {
      this.setState({ errorMessage: "Something went wrong!" });
      this.setState({ loading: false });
    }
  }


  gotoLogin = () => {
    this.props.navigation.navigate('Login')
  }

  render() {
    const {email, password, repeatPassword, loading} = this.state

    return(
      <View style={styles.container}>
        <View >
          <View style={styles.content}>
            <Text style={styles.title}>
              New Account
            </Text>
            {
              this.state.errorMessage &&
              <Text style={{ color: '#FFC107', textAlign: 'center' }}>
                {this.state.errorMessage}
              </Text>
            }
            <TextInput 
              onChangeText={(email) => this.setState({ email })}
              style={styles.inputField}
              value={email}
              placeholder={"Email"}/>

            <TextInput 
              secureTextEntry={ true }
              onChangeText={(password) => this.setState({ password })}
              style={styles.inputField}
              value={password}
              placeholder={"Password"}/>

            <TextInput 
              secureTextEntry={ true }
              onChangeText={(repeatPassword) => this.setState({ repeatPassword })}
              style={styles.inputField}
              value={repeatPassword}
              placeholder={"Confirm Password"}/>
            
            <TouchableOpacity onPress={this.handleSignUp}>
              <View style={[styles.buttonContainer]}>
                <Text style={styles.buttonTitle}>Sign Up</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={ this.gotoLogin }>
              <View style={styles.signInButton}>
                <Text style={styles.signinText}>
                  Already Member? {' '}
                </Text>
                <Text style={{color: 'white', fontWeight: 'bold', fontSize: normalize(16)}}>Sign In</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Loading show={loading} label="subscribing" closeLoading={() => {this.setState({loading: false})}}></Loading>
      </View>
    )

  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'linear-gradient(rgba(31, 33, 65, 0.88), rgb(87, 95, 172))'
  },
  homeImage: {
    width: '100%',
    height: '100%',
  },
  title:{
    color: 'white',
    fontSize: 25,
    marginBottom: 20
  },
  headerImage: {
    width: normalize(200),
    height: normalize(60),
    margin: 15
  },
  content: {
    marginLeft: 30,
    marginRight: 30,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputField: {
    fontSize: 17,
    marginTop: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    width: width - 60,
    paddingLeft: 20,
    paddingRight: 20
  },
  messageText: {
    color: '#d00',
    textAlign: 'center',
    fontSize: normalize(16),
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 30,
  },
  signinText: {
    fontSize: normalize(16),
    color: 'white',
    textAlign: 'center',
  },
  signUpImage: {
    width: normalize(16),
    height: normalize(16)
  },
  buttonContainer: {
    backgroundColor: 'rgba(195,195,195,0.60)',
    borderRadius: 20,
    height: 44,
    minWidth: 120,
    display: 'flex',
    justifyContent: 'center',
    width: width - 60,
    marginTop: 20
  },
  buttonTitle: {
    fontSize: normalize(16), 
    color: '#ffffff',
    fontWeight: 'normal',
    textAlign: 'center'
  },
})



export default SignUp