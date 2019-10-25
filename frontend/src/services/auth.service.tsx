import React, { useCallback } from 'react';
import { useApolloClient } from '@apollo/react-hooks';
import { Redirect } from 'react-router-dom';
import { useCacheService } from './cache.service';


export const withAuth = <P extends object>(
    Component : React.ComponentType<P>
) => {
    return (props:any) => {
        if (!isSignedIn()) {
            if (props.history.location.pathname === '/sign-in') {
                return null;
            }

            return <Redirect to="/sign-in" />;
        }

        useCacheService();

        return <Component {...props as P} />;
    };
};

export const signIn = ( authToken : string) => {
    document.cookie = `authToken=${authToken}`;

    // This will become async in the near future
    return Promise.resolve();
}

export const useSignOut = () => {
    const client = useApolloClient();
    
    return useCallback(() => {
        // 'expires' represents the lifespan of a cookie. Beyond that date the cookie will 
        // be deleted by the browser. 'expires' cannot be viewed from 'document.cookie'
        document.cookie = `authToken=;expires=${new Date(0)}`;
        
        // Clear cache
    }, [client])
};

export const isSignedIn = () => {
    return /authToken = .+(;|$)/.test(document.cookie);
}