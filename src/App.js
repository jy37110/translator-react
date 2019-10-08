import React from 'react';
import './App.css';
import { Container, Col, Row, Form, Dropdown, Button, Spinner} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default class App extends React.Component{
  constructor(prop){
    super(prop);
    this.targetLanguageList = [{language: "English", code: "en"}, {language: "Arabic", code: "ar"}, {language: "Chinese Simplified", code: "zh"},
    {language: "Chinese Traditional", code: "zh-TW"}, {language: "Czech", code: "cs"}, {language: "Danish", code: "da"}, {language: "Dutch", code: "nl"}, 
    {language: "Finnish", code: "fi"}, {language: "French", code: "fr"}, {language: "German", code: "de"}, {language: "Hebre", code:"he"}, 
    {language: "Indonesian", code: "id"}, {language: "Italian", code: "it"}, {language: "Japanese", code: "ja"}, {language: "Korean", code: "ko"}, 
    {language: "Polish", code: "pl"}, {language: "Portuguese", code: "pt"}, {language: "Russian", code: "ru"}, {language: "Spanish", code: "es"}, 
    {language: "Swedish", code: "sv"}, {language: "Turkish", code: "tr"}];
    
    this.pollyLanguageMap = {en: {code: 'en-GB', voiceId: 'Amy'}, ar: {code: 'arb', voiceId: 'Zeina'}, 
    zh: {code: 'cmn-CN', voiceId: 'Zhiyu'}, zhTW: {code: 'cmn-CN', voiceId: 'Zhiyu'}, da: {code: 'da-DK', voiceId: 'Mads'},
    nl: {code: 'nl-NL', voiceId: 'Lotte'}, fr: {code: 'fr-FR', voiceId: 'Celine'}, de: {code: 'de-DE', voiceId: 'Marlene'}, it: {code: 'it-IT',
    voiceId: 'Giorgio'}, ja: {code: 'ja-JP', voiceId: 'Mizuki'}, ko: {code: 'ko-KR', voiceId: 'Seoyeon'}, sv: {code: 'sv-SE', voiceId: 'Astrid'},
    pl: {code: 'pl-PL', voiceId: 'Ewa'}, pt: {code: 'pt-PT', voiceId: 'Ines'}, ru: {code: 'ru-RU', voiceId: 'Maxim'}, es: {code: 'es-MX',
    voiceId: 'Mia'}, tr: {code: 'tr-TR', voiceId: 'Filiz'}};
    
    this.inputTxt = "";
    this.outputTxt = "";
    this.state = {
      targetLanguageName: "English",
      targetLanguageCode: "en",
      outputTxt: "",
      inputVoiceSource: "",
      outputVoiceSource: "",
      loading: false
    };
  }
  
  handleTranslateBtnClicked = () => {
    if(this.inputTxt.length > 0) {
      this.setState({loading: true});
      this.requestTranslation().then(data => {
        this.outputTxt = data.TranslatedText;
        if(data.hasOwnProperty('errorType')){
          this.setState({outputTxt: this.inputTxt, loading: false});
          return;
        }
        this.setState({outputTxt: data.TranslatedText, loading: false});
        
        console.log(data);
        let sourceCode = data.SourceLanguageCode === "zh-TW" ? "zhTW" : data.SourceLanguageCode;
        let targetCode = data.TargetLanguageCode === "zh-TW" ? "zhTW" : data.TargetLanguageCode;
        
        let sourceObj = this.pollyLanguageMap[sourceCode];
        let targetObj = this.pollyLanguageMap[targetCode];
        
        if(sourceObj !== undefined) {
          let sourceVoiceId = sourceObj.voiceId;
          this.requestVoice(this.inputTxt, sourceVoiceId).then(data => {
            console.log(data);
            this.setState({inputVoiceSource: data.url}, () => {
              this.refs.audioIn.pause();
              this.refs.audioIn.load();
            });
            
          }, err => {
            console.log(err);
          });
        }
        if(targetObj !== undefined) {
          let targetVoiceId = targetObj.voiceId;
          this.requestVoice(this.outputTxt, targetVoiceId).then(data => {
            console.log(data);
            this.setState({outputVoiceSource: data.url}, () => {
              this.refs.audioOut.pause();
              this.refs.audioOut.load();
            });
          }, err => {
            console.log(err);
          });
        }
      }, err => {
        console.log(err);
        //console.log(this.inputTxt);
        this.setState({outputTxt: this.inputTxt});
      });
    }
  }
  
  requestTranslation = async () => {
    let param = {txt: this.inputTxt, TargetLanguageCode: this.state.targetLanguageCode};
    const response = await fetch('https://muk4o6xjke.execute-api.us-west-2.amazonaws.com/tran/translate', {
            method: 'POST',
            body: JSON.stringify(param),
            headers: {
                'Content-Type': 'application/json',
            }
        });
    return await response.json();
  }
  
  requestVoice = async (txt, voiceId) => {
    let param = {txt: txt, voiceId: voiceId};
    const response = await fetch('https://yg8w9eolze.execute-api.us-west-2.amazonaws.com/polly/polly', {
            method: 'POST',
            body: JSON.stringify(param),
            headers: {
                'Content-Type': 'application/json',
            }
        });
    return await response.json();
  }
  
  
  render(){
    const spinner = <Spinner
      style={{marginLeft: 2}}
      as="span"
      animation="border"
      size="sm"
      role="status"
      aria-hidden="true"
    />;
    return(
      <Container className="App">
        <Row>
          <div className="title-section">
            <h2>AI Translator</h2>
          </div>
        </Row>
        <Row>
          <Col lg="6" className="input-col">
            <div className="input-section">
              <Form.Label>Input</Form.Label>              
              <Form.Control as="textarea" onChange={(e) => this.inputTxt = e.target.value}/>
            </div>
            <div className="input-audio-container">
              <audio controls ref="audioIn">
                <source src={this.state.inputVoiceSource} type="audio/ogg" />
              </audio>
            </div>
          </Col>
          <Col lg="6" className="output-col">
            <div className="output-section">
              <Form.Label>Output</Form.Label>   
              <Button style={{float:'right', marginLeft:'0.5rem'}} size="sm" onClick={this.handleTranslateBtnClicked}>
                Translate
                {this.state.loading ? spinner : null}
              </Button>
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic" size="sm">
                  {this.state.targetLanguageName}
                </Dropdown.Toggle>
  
                <Dropdown.Menu>
                  {this.targetLanguageList.map((item, index) => {
                    return(
                        <Dropdown.Item 
                        key={index} 
                        onClick={() => this.setState({targetLanguageCode: item.code, targetLanguageName: item.language})}>
                        {item.language}
                </Dropdown.Item>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
              <Form.Control as="textarea" value={this.state.outputTxt} disabled />
            </div>
            <div className="output-audio-container">
              <audio controls ref="audioOut">
                <source src={this.state.outputVoiceSource} type="audio/mpeg" />
              </audio>
            </div>
          </Col>
        </Row>
      </Container>
      );
  }
  
}
