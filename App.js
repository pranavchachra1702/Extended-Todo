import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { Amplify, API, graphqlOperation, Auth } from 'aws-amplify';
// import { API, graphqlOperation, Auth } from 'aws-amplify';
import awsconfig from './src/aws-exports';
// import config from './src/aws-exports';
import { createTodo, updateTodo, addComment } from './src/graphql/mutations';
import { listTodos } from './src/graphql/queries';
// import { createComment } from './src/graphql/mutations';
import { withAuthenticator } from 'aws-amplify-react-native';

Amplify.configure(awsconfig);
Auth.configure(awsconfig);
// const initialState = { Name: '', description: '', comment:'' };

const ToDoApp = () => {
  
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ name: '', description: '' });
  const [newComment, setNewComment] = useState('');
  //signOut();

  useEffect(() => {
    //fetchTodos();
    // setFormState(initialState);
    // setTodos([]);
    
  }, []);

  function setInput(key, value) {
    setNewTodo({ ...newTodo, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      const todosList = todoData.data.listTodos.items;
      setTodos(todosList);
    } catch (err) {
      console.log('error fetching todos');
    }
  }
  async function addComment(todoId) {
    try {
      const input = {todoId, text: newComment };
      const result = await API.graphql(graphqlOperation(addComment, { input}));
      // Fetch the updated todo item with the new comment
      setNewComment('');
      // fetchTodos();
    
    } catch (error) {
      console.log('Error adding comment:', error);
    }
  }
  
  async function addTodo() {
    try {
      // const input = { ...newTodo };
      const name = newTodo.name.trim();
      if (name == '') {
        console.log('Name required');
        return;
      }
      const input = {
        name,
        description: newTodo.description,
        comments: newTodo.comments ? newTodo.comments.split(',').map((comment) => comment.trim()) : [],
      };
      
      // setTodos([...todos, todo]);
      // setFormState(initialState);
      const result = await API.graphql(graphqlOperation(createTodo, {input}));
      setNewTodo({ name: '', description: '' });
      // fetchTodos();
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }
  const handleAddTodo = (newTodo) => {
    setTodos([...todos, newTodo]);
  };
  const handleAddComment = async (todo) => {
    try {
      // const updatedTodo = await API.graphql(
      //   graphqlOperation(addComment, {
      //    // todoId: todos.id,
      //     text: setNewComment, //NewComment
      //   })
      // );
      await addComment(todo.id, newComment); // Corrected parameters
      // fetchTodos(); // Refresh todo list after adding comment
      // console.log('Comment Added Successfully', updatedTodo.data.addComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  async function signOut()  {
    try {
      await Auth.signOut();
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };
  const handleSubmit = async () => {
    try {
      const newTodo = await API.graphql(
        graphqlOperation(createTodo, {
          name,
          description,
          comments: comments.split(',').map(comment => comment.trim()),
        })
      );
      // onAddTodo(newTodo.data.createTodo);
      // setName(initialState);
      // setDescription(initialState);
      // setComments(initialState);
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };
  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={val => setInput('name', val)}
        style={styles.input}
        value={newTodo.name}
        placeholder="Name"
      />
      <TextInput
        onChangeText={val => setInput('description', val)}
        style={styles.input}
        value={newTodo.description}
        placeholder="Description"
      />
      <TextInput
        onChangeText={val => setInput('comment', val)}
        style={styles.input}
        value={newTodo.comment}
        placeholder="Comments (Comma-separated)"
      />
      
      <Button title="Create Todo" onPress={addTodo} color="green"/>
      {/* <Button title="Create Todo" onPress={handleSubmit} color="green"/> */}
      {/* <Button title="Sign Out" onPress={signOut} color="red" /> */}
      <TextInput
        style={styles.input}
        placeholder="Comment"
        value={newComment}
        onChangeText={setNewComment}
      />
      <Button title="Add Comment" onPress={()=>handleAddComment(todo)} />
      <View style={styles.todoListWrapper}>
      {todos.map((todo, index) => 
      (
      <View key={todo.id ? todo.id : index} style={styles.todo}>
      <Text style={styles.todoName}>{todo.name}</Text>
      <Text>{todo.description}</Text>
      <View>
        {todo.comments.items.map(comment => (
          <Text key={comment.id} style={styles.comment}>{comment.text}</Text>
        ))}
      </View>
      {/* <View>
        {todos.newComment.items.map((newComment) => (
          <Text key={newComment.id} style={styles.newComment}>{newComment.content}</Text>
        ))}
      </View> */}
      {/* <TextInput
        placeholder="Add a comment"
        onSubmitEditing={event => addComment(event.nativeEvent.text, todo.id)}
        style={styles.input}
      /> */}
      </View>
    ))}
   </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    justifyContent: 'flex-start',
    padding: 20,
  },
  todo: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    height: 50,
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 8,
  },
  todoListWrapper: { marginTop: 20 },
  todoName: { fontSize: 18 },
  signOutButton: { 
    backgroundColor: '#ff0000', 
    color: '#ffffff', 
  },
  newComment: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 10,
  }
});

 export default withAuthenticator(ToDoApp);
