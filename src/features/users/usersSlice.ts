import { apiSlice } from "../api/apiSlice";

export const usersSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getUsers: builder.query({
      query: () => '/users',
      keepUnusedDataFor: 5 // cache users data for 5s with rtk-query
    })
  })
})

export const {useGetUsersQuery} = usersSlice;