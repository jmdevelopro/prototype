import React from 'react';
import uuidv4 from 'uuid/v4';
import { Segment, Button, Input} from 'semantic-ui-react';
import firebase from '../../firebase';

import FileModal from './FileModal';

class MessageForm extends React.Component{


    state ={
        storageRef: firebase.storage().ref(),
        uploadTask: null,
        uploadState: '',
        percentuploaded:0,
        message:'',
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        loading: false,
        errors:[],
        modal: false
    }


    openModal = ()=> this.setState({modal: true});

    closeModal = ()=> this.setState({modal:false});

    handelChange = event =>{
        this.setState({[event.target.name]: event.target.value});
    }

    createMessage = (fileUrl=null) =>{
        const message = {

            timestamp: firebase.database.ServerValue.TIMESTAMP,
            content: this.state.message,
            user:{
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            },

        };

        if(fileUrl !== null){
            message['image'] =fileUrl;

        }else{
            message['content'] = this.state.message;
        }
        return message;
    }

    sendMessage =() =>{
        const {messageRef} = this.props;
        const { message, channel } = this.state;
        
        if(message){
            // send message
            
            this.setState({loading:true});

            messageRef
            .child(channel.id)
            .push()
            .set(this.createMessage())
            .then(()=>{
                this.setState({ loading: false, message:'', errors:[]})
            }).catch(err=>{
                console.error(err);
                this.setState({
                    loading:false,
                    errors: this.state.errors.concat(err)
                })
            })


        }else {
            this.setState({
                errors: this.state.errors.concat({message: "Add a message"})
            })
        }
    }


    uploadFile = (file, metadata)=>{
        const pathToUpload = this.state.channel.id;
        const ref = this.props.messagesRef;
        const filePath = `chat/public/${uuidv4().jpg}`


        this.setState({
            uploadState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
        },()=>{
            this.state.uploadTask.on('state_changed', snap =>{
                const percentuploaded = Math.round((snap.bytesTransferred / snap.totalBytes) *100);
                this.setState({percentuploaded})
            }, err=>{
                console.error(err);
                this.setState({errors: this.state.errors.concat(err),uploadState: 'error', uploadTask: null})
            })
        },()=>{
            this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl =>{
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
            }).catch(err=>{
                console.error(err);
                this.setState({errors: this.state.errors.concat(err),uploadState: 'error', uploadTask: null})
            })
        })
    }


    sendFileMessage = (fileUrl, ref, pathToUpload)=>{
        ref.child(pathToUpload).push().set(this.createMessage(fileUrl)).then(()=>{
            this.UNSAFE_componentWillMount.setState({uploadState: 'done '})
        }).catch(err=>{
            console.error(err);
            this.setState({
                errors: this.state.errors.concat(err)
            })
        })
    }


    render(){

        const {errors, message, loading, modal } = this.state;

        return(

            <Segment className="message__form">
                <Input
                    fluid
                    name="message"
                    onChange={this.handelChange}
                    value={message}
                    style={{ marginBottom: '0.7em'}}
                    label={<Button icon={'add'}/>}
                    labelPosition="left"
                    className={errors.some(error => error.includes('message'))? 'error': ''}
                    placeholder="write your message"/>
                    <Button.Group icon widths="2">
                        <Button
                            onClick={this.sendMessage}
                            disabled={loading}
                            color="orange"
                            content="Add Reply"
                            labelPosition="left"
                            icon="edit"
                            />
                        <Button
                            color="teal"
                            onClick={this.openModal}
                            content="Upload Media"
                            labelPosition="right"
                            icon="cloud upload"/>
                            <FileModal 
                            modal={modal}
                            closeModal={this.closeModal}
                            />
                        <FileModal
                            modal={modal}
                            closeModal={this.closeModal}
                            uploadFile={this.uploadFile}
                            />


                    </Button.Group>
            </Segment>


        )
    }
}

export default MessageForm;