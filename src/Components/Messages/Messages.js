import React from "react";
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import { Segment, Comment} from 'semantic-ui-react';
import firebase from '../../firebase';
import Message from './Message';

class Messages extends React.Component {

    state ={
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef: firebase.database().ref('privateMessages'),
        messagesRef: firebase.database().ref('messages'),
        messages:[],
        messagesLoading: true,
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        numUniqueUsers: '',
        searchTerm:'',
        searchLoading: false,
        serarchResults:[]
    }

    componentDidMount(){
        const { channel, user}= this.state;

        if(channel && user){
            this.addListeners(channel.id);
        }
    }

    addListeners = channelId =>{
        this.addMessageListener(channelId);

    }



    
    addMessageListener =channelId =>{
        let loadedMessages = [];
        const ref = this.getMessagesRef();
        ref.child(channelId).on('child_added', snap =>{
            loadedMessages.push(snap.val());
            console.log(loadedMessages);
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            });
            this.countUniqueUsers(loadedMessages);
        });
    };
    
    getMessagesRef = ()=>{
        const { privateMessagesRef, privateChannel, messagesRef} = this.state;
        return privateChannel? privateMessagesRef: messagesRef;
    }

    handleSearchChange = event =>{
        this.setState({
            serachTerm: event.target.value,
            searchLoading: true
        },()=> this.handlesearchMessages());
    }

    handlesearchMessages=()=>{
        const channelMessages =[...this.state.messages];
        const regex = new RegExp(this.state.searchTerm,'gi');
        const serarchResults = channelMessages.reduce((acc, message)=>{
            if(message.content && message.content.match(regex) || message.user.name.match(regex)){
                acc.push(message);
            }
            return acc;
        },[]);
        this.setState({serarchResults});
        setTimeout(() => {
            
            this.setState({searchLoading:false});
        }, 1000);
    }

    countUniqueUsers = messages =>{
        const uniqueUsers = messages.reduce((acc, message)=>{
            if(!acc.includes(message.user.name)){
                acc.push(message.user.name);
            }
            return acc;
        },[]);
        const plural = uniqueUsers.length >1 || uniqueUsers.length ===0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's':''}`;
        this.setState({ numUniqueUsers});
    }

    displayMessages = messages=>{
     return messages.length > 0 && messages.map(message =>(
            <Message 
                key={message.timestamp}
                message={message}
                user={this.state.user}
            />
        ))
    }


    displayChannelName = channel => {
        return channel ? `${this.state.privateChannel ? '@':'#'}${channel.name}`:'';
    }


  render() {
    const {messagesRef, channel,messages, user,numUniqueUsers, searchTerm, searchResult, searchLoading, privateChannel} = this.state;

    return (
        <React.Fragment>
            <MessagesHeader
            channelName={this.displayChannelName(channel)}
            numUniqueUsers = {numUniqueUsers}
            handleSearchChange={this.handleSearchChange}
            searchLoading={searchLoading}
            isPrivateChannel={privateChannel}
            ></MessagesHeader>
            <Segment>
                <Comment.Group className="messages">
                {searchTerm ? this.displayMessages(searchResult):this.displayMessages(messages)}
                </Comment.Group>

            </Segment>
            <MessageForm
                messageRef={messagesRef}
                currentChannel={channel}
                currentUser={user}
                isPrivateChannel={privateChannel}
                getMessagesRef={this.getMessagesRef}
            />
        </React.Fragment>
        
    
        );
  }
}

export default Messages;
