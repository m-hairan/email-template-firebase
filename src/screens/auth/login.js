import React from 'react'
import { 
  StyleSheet, 
  Text, 
  View, 
  ImageBackground, 
  TextInput, 
  Image, 
  Alert,
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,  
  Animated
} from 'react-native'

import firebase from 'react-native-firebase'
import CountryPicker from 'react-native-country-picker-modal';
import Loading from '../loading'
import normalize from '../../helpers/sizeHelper'

const { height, width } = Dimensions.get('window')

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      countryCode : 'AX',
      phoneCode : '',
      confirmResult: null,
      smscode:'',
      phoneNum: '',
      phoneVerified: false,
      errorMessage: null,
      loading: false,
    }

  }

  gotoSignUpPage() {
    this.props.navigation.navigate('SignUp')
  }

  validate = async() => {
    let valid = true;

    const { email, password } = this.state
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

    this.setState({errorMessage: null})
    return true
  }

  validatePhoneNumber = () => {
    const { phoneNum, phoneCode } = this.state
    
    if(phoneNum == ''){
      this.setState({errorMessage: 'Please fill phone number'})
      return false
    }
    if(phoneNum.length < 9){
      this.setState({errorMessage: 'Phone number should be at least 9 digits'})
      return false
    }

    this.setState({errorMessage: null})
    return true
  }


  validateSMS = () => {
    const { smscode } = this.state

    if(smscode == ''){
      this.setState({errorMessage: 'Please fill SMS code'})
      return false
    }
    if(smscode.length != 6){
      this.setState({errorMessage: 'SMS code should be 6 digits'})
      return false
    }

    this.setState({errorMessage: null})
    return true
  }

  onSelectCountry = (country) => {
    this.setState({countryCode:country['cca2'],phoneCode:country['callingCode']});
    this.forceUpdate();
  }

  handleVerifiyPhone = async () => {
    const { phoneNum, phoneCode } = this.state

    if(!this.validatePhoneNumber())
      return 

    try {
      this.setState({ loading: true })

      await firebase
        .auth()
        .signInWithPhoneNumber(`+${phoneCode}${phoneNum}`)
        .then(confirmResult => {
          this.setState({ confirmResult })
        })
      this.setState({ loading: false })
    } catch(error) {
      this.setState({ loading: false }) 
      this.setState({errorMessage: error.message})
    }
  }

  handleVerifyCode = async () => {
    const { confirmResult, smscode } = this.state

    if(!this.validateSMS())
      return

    try {
      this.setState({ loading: true })

      await confirmResult
        .confirm(smscode)
        .then(user => {
          Alert.alert(
            'Success',
            'Your phone number is verified!',
            [
              {text: 'OK', onPress: () => this.setState({phoneVerified: true})},
            ],
            {cancelable: false},
          )
        })

      this.setState({ loading: false })
      await firebase.auth().signOut();
    } catch(error) {
      this.setState({ loading: false })
      this.setState({errorMessage: error.message})
    }
  }

  handleLogin = async () => {
    const { email, password } = this.state

    if (!await this.validate()) 
      return 

    try {
      this.setState({ loading: true });

      await firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => this.props.navigation.navigate('WelcomeNew'))
        .catch(error => this.setState({ errorMessage: error.message }))

      this.setState({ loading: false }); 

    } catch (error) {
      this.setState({ errorMessage: "Something went wrong!" });
      this.setState({ loading: false });
    }
  }

  gotoResetPassword = () => {
    this.props.navigation.navigate('ForgotPassword')
  }

  render() {
    const { email, password, errorMessage, loading, phoneVerified, phoneCode, confirmResult } = this.state

    return(
      <ImageBackground style={styles.homeImage} source={require('../../../assets/images/background.jpg')}>
        
        {!phoneVerified && 
          <View style={styles.phoneModalContainer}>
            <View style={styles.animateContent}>
              <Text style={styles.caption}>Verify your phone number</Text>
              {
                errorMessage && !phoneVerified &&
                <Text style={{color: '#FFC107', textAlign: 'center'}}>
                  {errorMessage}
                </Text>
              }

              {confirmResult == null?
                <View style={styles.countryPicker}>
                  <CountryPicker
                    closeable
                    style={{marginLeft:0}}
                    countryCode={this.state.countryCode}
                    withCallingCode = {true}
                    onSelect = {(country) => this.onSelectCountry(country)}
                    translation='eng'/>
                  <Text>+{phoneCode}</Text>
                  <TextInput keyboardType="phone-pad" 
                    style={{flex:1,height:40,marginLeft:5}} 
                    onChangeText={(text) => this.setState({phoneNum:text})}></TextInput>
                </View>:
                <View style={styles.suInput}>
                  <Text style={{fontSize:25}}>S U</Text>
                  <View>
                      <TextInput maxLength={6} keyboardType="phone-pad" 
                        style={[styles.inputSms,{width:100,textAlign:'center', fontSize:17}]} 
                        onChangeText={(text) => this.setState({smscode:text})}></TextInput>
                      <View style={{height:1,backgroundColor:'#000',width:100,marginLeft:5}}></View>
                  </View>
                </View>
              }
              <View style={[styles.button, {marginTop:20}]}>
                <TouchableOpacity onPress={ confirmResult == null?this.handleVerifiyPhone:this.handleVerifyCode }>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </View>
              {confirmResult != null && 
                <View style={{marginTop:20}}>
                  <TouchableOpacity onPress={ () => {this.setState({confirmResult: null})} }>
                    <Text style={[styles.textLabelLink, {fontSize: 16, textAlign:'center'}]}>
                      Change phone number
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            </View>
          </View>
        }

        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={{color:'white',fontSize:50, marginBottom: 30, textAlign: 'center'}}>Logo</Text>
            {
              errorMessage && phoneVerified &&
              <Text style={{color: '#FFC107', width: width - 60, textAlign: 'center'}}>
                {errorMessage}
              </Text>
            }
            <TextInput 
              inlineImageLeft='search_icon'
              onChangeText={(email) => this.setState({ email })}
              style={styles.inputField}
              value={email}
              placeholderTextColor = "#ccc"
              placeholder={"Email"}/>
              
            <TextInput 
              secureTextEntry={ true }
              onChangeText={(password) => this.setState({ password })}
              style={styles.inputField}
              value={password}
              placeholderTextColor = "#ccc"
              placeholder={"Password"}/>
            
            <View style={styles.buttonGroup}>
              <View>
                <TouchableOpacity onPress={ this.gotoResetPassword }>
                  <View>
                    <Text style={styles.textLabel}>
                      Forgot your password?
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.button}>
                <TouchableOpacity onPress={ this.handleLogin }>
                  <View>
                    <Text style={styles.buttonText}>Login</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={styles.hRule}
            />

            <View style={styles.buttonGroupCenter}>
              <View>
                <Text style={styles.textLabel}>
                  New here?
                </Text>
              </View>
              <View>
                <TouchableOpacity onPress={ this.gotoSignUpPage.bind(this) }>
                  <View>
                    <Text style={styles.textLabelLink}>
                      Create an account
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <Loading show={loading} label="subscribing" closeLoading={() => {this.setState({loading: false})}}></Loading>
      </ImageBackground>
    )

  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15
  },
  content: {
    flex: 1,
    justifyContent: 'center'
  },
  homeImage: {
    width: '100%',
    height: '100%',
  },
  headerImage: {
    marginTop: 20,
  },
  phoneModalContainer: {
    position:'absolute',
    width:'100%',
    height:'100%', 
    zIndex: 1000,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.5)'
  },
  animateContent: {
    backgroundColor:'linear-gradient(rgba(31, 33, 65, 0.88), rgb(87, 95, 172))',
    width:'100%',
    paddingTop: 50,
    paddingBottom: 50,
    borderRadius: 10,
    paddingLeft:20,
    paddingRight:20
  },
  caption: {
    marginBottom: 50,
    fontSize: 25,
    color: 'white',
    textAlign:'center'
  },
  countryPicker: {
    flexDirection:'row',
    backgroundColor:'#fff',
    borderRadius:6,
    paddingLeft:15,
    paddingRight:15,
    height:50,
    alignItems:'center',
  },
  suInput: {
    flexDirection:'row',
    backgroundColor:'#fff',
    borderRadius:10,
    height:80,
    alignItems:'center',
    justifyContent:'center',
    paddingLeft:15,
    paddingRight:15
  },
  inputField: {
    fontSize: 17,
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 6,
    width: width - 60,
    paddingLeft: 20,
    paddingRight: 20
  },

  textLabel: {
    color: 'white',
    lineHeight: 40,
  },
  textLabelLink: {
    color: 'white',
    lineHeight: 40,
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationColor: "white",
    marginRight: 10,
    marginLeft: 10
  },

  buttonGroupCenter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop:20,
  },

  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  button: {
    backgroundColor: 'rgba(195,195,195,0.60)',
    borderRadius: 3,
    height: 44,
    minWidth: 120,
    display: 'flex',
    justifyContent: 'center'
  },

  buttonText: {
    fontSize: normalize(17),
    color: 'white',
    lineHeight: 44,
    paddingRight: 30,
    paddingLeft: 30,
    fontWeight: '600',
    textAlign: 'center'
  },

  hRule:{
    borderBottomColor: 'white',
    borderBottomWidth: 1,
    paddingTop: 15,
    paddingBottom: 10,
    marginLeft: 20,
    marginRight: 20
  },

  contentText: {
    fontSize: normalize(20),
    color: 'white',
    textAlign: 'center',
    padding: 15
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 30,
  },
  signinText: {
    fontSize: normalize(20),
    color: 'white',
    textAlign: 'center',
  },
  signInImage: {
    width: normalize(20),
    height: normalize(20)
  },
  

  welcomeText: {
    fontSize: normalize(12),
    lineHeight: 18,
    color: 'white',
    textAlign: 'center',
    padding: 15,
    // flexWrap: 'wrap',
  
  }
})



export default Login