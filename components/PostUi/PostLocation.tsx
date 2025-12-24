'use client'

import {Map, MapCameraChangedEvent, Pin, AdvancedMarker} from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

import PostMap from './PostMap';

type Location = {
    id: string
    formattedAddress: string,
    location: {
        latitude: number,
        longitude: number
    }
}

export default function PostLocation(props:{locationData:{
				tag: string,
				index: number,
				tagText: string
			} | undefined, googleMapsApiKey:string | undefined}) {   

    if (!props.locationData)
        return <></>

    const locationData = props.locationData;
    const [location, setLocation] = useState<Location>();

    const getLocation = () => {
        const address = locationData.tagText;

        if (address !== '') {
            // Replace with your actual Place ID and API Key
            // const placeId = process.env.GOOGLE_MAPS; // Example Place ID for "Peace Harmony"
            const apiKey = props.googleMapsApiKey;

            // Make the fetch request
            if (apiKey) {
                // Construct the URL for a Place Details (New) request
                const url = 'https://places.googleapis.com/v1/places:searchText';

                const requestBody = {
                    textQuery: address,
                };

                const fieldMask = 'places.location,places.formattedAddress,places.id';

                fetch(url, {
                    method: 'POST', // Place Details (New) uses GET requests
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': apiKey,
                        'X-Goog-FieldMask': fieldMask
                    },
                    body: JSON.stringify(requestBody)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.places && data.places.length) {
                        setLocation(data.places[0] as Location)
                    }
                })
                .catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
            }
        } 
    }

    useEffect(() => {
        getLocation();
    }, [])

    return (
        <PostMap location={location}/>
    )
}