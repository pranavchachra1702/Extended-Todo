export const createTodo = /* GraphQL */ `
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      name
      description
      comments {
        id
        text
        createdAt
      }
    }
  }
`;

export const updateTodo = /* GraphQL */ `
  mutation UpdateTodo($input: UpdateTodoInput!) {
    updateTodo(input: $input) {
      id
      name
      description
      comments {
        id
        text
        createdAt
      }
    }
  }
`;

export const addComment = /* GraphQL */ `
  mutation AddComment($input: CreateCommentInput!) {
    addComment(input: $input) {
      id
      text
      createdAt
    }
  }
`;
