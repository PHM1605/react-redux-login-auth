import {BaseQueryApi, BaseQueryFn, createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import { setCredentials, logOut } from '../auth/authSlice';
import { RootState } from '../../app/store';

interface IRefreshToken {
  token: string
}

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3500',
  credentials: 'include', // send httpOnly secure cookie for sending RefreshToken
  prepareHeaders: (headers, {getState}) => {
    const token = (getState() as RootState).auth.token;
    if(token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  }
}); 

const baseQueryWithReauth: BaseQueryFn = async (args:string, api: BaseQueryApi, extraOptions: {shout?:boolean}) => {
  let result = await baseQuery(args, api, extraOptions);
  // 401: Unauthorized - no accessToken; 403: Forbidden - accessToken has expired
  if (result?.error && 'originalStatus' in result.error) {
    if (result.error.originalStatus === 403) {
      const refreshResult = await baseQuery('/refresh', api, extraOptions);
      const refreshData = refreshResult.data as IRefreshToken;
      if (refreshResult?.data) {
        const user = (api.getState() as RootState).auth.user;
        api.dispatch(setCredentials({...refreshData, user}))
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logOut());
      }
    }
  }
  return result;
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({})
});