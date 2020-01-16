import React from 'react'
import { 
  StyleSheet, 
  Text, 
  View, 
  ImageBackground, 
  TextInput, 
  Image, 
  TouchableOpacity, 
  Alert,
  Dimensions, 
  NativeModules } from 'react-native'
import firebase from 'react-native-firebase'
import normalize from '../../helpers/sizeHelper'
import Loading from '../loading'

const { height, width } = Dimensions.get('window')


class ForgotPassword extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      email: '',
      loading: false,
      errorMessage: null
    }
  }

  validate = async() => {
    let valid = true;

    const { email } = this.state
    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/

    if(email === ''){
      this.setState({errorMessage: 'Email is required!'})
      return false 
    }

    if(!regex.test(email)) {
      this.setState({errorMessage: 'Email is not correct format!'})
      return false 
    }

    return true
  }

  handlePasswordReset = async () => {
    const { email } = this.state

    if (!await this.validate()) {
      return ;
    }

    try {
      this.setState({ loading: true })
      await firebase.auth().sendPasswordResetEmail(email)

      Alert.alert(
        'Email Sent',
        'Please check your email...',
        [
          {text: 'OK'},
        ],
        {cancelable: false},
      )

      this.setState({ loading: false })
      this.props.navigation.navigate('Login')
    } catch (error) {
      this.setState({ loading: false })
      this.setState({errorMessage: error.message})
    }
  }


  render() {
    const {email, loading, errorMessage} = this.state

    return(
      <View style={styles.container}>
        <View >
          <View style={styles.content}>
            <Text style={styles.title}>
              Reset Password
            </Text>
            {
              this.state.errorMessage &&
              <Text style={{ color: '#FFC107', textAlign:'center' }}>
                {errorMessage}
              </Text>
            }
            <TextInput 
              onChangeText={(email) => this.setState({ email })}
              style={styles.inputField}
              value={email}
              placeholder={"Email"}/>
            
            <TouchableOpacity onPress={this.handlePasswordReset}>
              <View style={[styles.buttonContainer]}>
                <Text style={styles.buttonTitle}>Send Email</Text>
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



export default ForgotPassword