import React, { useEffect, useState } from "react";

const Homepage = () => {
    const [elementData, setElementData] = useState([]);

    useEffect(() => {
        staticData();
    },[])

    const staticData = async () => {
        const apiURL = "https://draft.premierleague.com/api/bootstrap-static";
        await fetch(apiURL,{
            method: "GET",
            headers: {
                "Access-Control-Allow-Origin" : "*"
            }
        })
        .then((response) => {
            //setElementData(response.json());
            console.log(response.json());
        })
    }

    return(
        <main>
            <div>
                <h1>
                    This is a Title!!
                </h1>
            </div>
            {elementData.map(player => (
                <div key={player.id}>
                    {player.web_name} - {player.total_points}
                </div>
            ))}
        </main>
    );
};

export default Homepage;