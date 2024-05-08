import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { Amplify, API, graphqlOperation, Auth } from 'aws-amplify';
// import { API, graphqlOperation, Auth } from 'aws-amplify';
import awsconfig from './src/aws-exports';
// import config from './src/aws-exports';
import { createTodo, updateTodo, addComment } from './src/graphql/mutations';
import { getTodo, listTodos } from './src/graphql/queries';
// import { createComment } from './src/graphql/mutations';
import { withAuthenticator } from 'aws-amplify-react-native';

Amplify.configure(awsconfig);
Auth.configure(awsconfig);
// const initialState = { Name: '', description: '', comment:'' };

const ToDoApp = () => {
  var array = [];
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ name: '', description: '', comment: '' });
  const [newComment, setNewComment] = useState('');
  //signOut();

  useEffect(() => {

    //setTodos([]);
    async function fetchTodos() {
      try {
        const todoData = await API.graphql(graphqlOperation(listTodos));
        const todosList = todoData.data.listTodos.items;
        setTodos(todosList);
      } catch (err) {
        console.log('error fetching todos');
      }
    }
    //fetchTodos();
    
  }, []);

  function setInput(key, value) {
    setNewTodo((newTodo) =>({ ...newTodo, [key]: value }));
  }

  
  async function addComment(todoId, commentText) {
    try {
      const input = {todoId, text: commentText };
      const result = await API.graphql(graphqlOperation(addComment, { input}));
      // Fetch the updated todo item with the new comment
      // setNewComment('');
      // fetchTodos();
    
    } catch (error) {
      console.log('Error adding comment:', error);
    }
  }
  
  async function addTodo() {
    try {
      const input = {
        name: newTodo.name.trim(),
        description: newTodo.description,
      };
      const result = await API.graphql(graphqlOperation(createTodo, {input}));

      if (!result.data || !result.data.createTodo) {
        throw new Error('Failed to create todo'); // Explicitly throw if no data returned
      }

      const createdTodo = result.data.createTodo;
      const todoId = createdTodo.id;

      if (newTodo.comment) {
        const comments = newTodo.comment.split(',').map((comment) => comment.trim());
        for (const comment of comments) 
        {
          await API.graphql(graphqlOperation(addComment,{input: { text: comment, todoId: todoId }}));
        }
      }
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  const handleAddTodo = (newTodo) => {
    setTodos([...todos, newTodo]);
  };
  const handleAddComment = async (todo) => {
    try {
      await addComment(todo.id, newComment);
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
  }
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
      <TextInput
        style={styles.input}
        placeholder="Comment"
        value={newComment}
        onChangeText={(val) => setNewComment(val)}
      />
      <Button title="Add Comment" onPress={() => handleAddComment(todos)} />
      <View style={styles.todoListWrapper}>
      {todos.map((todo, index) => 
      (
      <View key={todo.id ? todo.id : index} style={styles.todo}>
      <Text style={styles.todoName}>{todo.name}</Text>
      <Text>{todo.description}</Text>
      <View>
        {todo.comments.map(comment => (
          <Text key={comment.id} style={styles.comment}>{comment.text}</Text>
        ))}
      </View>
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
