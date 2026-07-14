export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    profilePic: String
  }

  type Note {
    id: ID!
    title: String!
    content: String!
    owner: User!
    createdAt: String!
    updatedAt: String!
  }

  type NotePage {
    items: [Note!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPrevPage: Boolean!
  }

  input NoteFilterInput {
    userId: ID
    title: String
    startDate: String
    endDate: String
  }

  type Query {
    notes(
      filter: NoteFilterInput
      page: Int = 1
      limit: Int = 10
    ): NotePage!

    noteById(id: ID!): Note
  }
`;
