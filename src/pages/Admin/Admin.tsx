import { useSubscription } from "@apollo/client";
import React, { useEffect } from "react";
import { MESSAGE_ADDED } from "../../graphql/queries/bartenderQueries";

function Admin() {
    const { data, error } = useSubscription(MESSAGE_ADDED);
    useEffect(() => {
        const fetch = async () => {
            console.log('Data:', data);
            console.log('Error:', error);
        }
        if (data) {
            fetch();
        }
    }, [data, error]);

    return (
        <>
            <h1>
                Admin
            </h1>
        </>
    );
  }
    
  export default Admin;