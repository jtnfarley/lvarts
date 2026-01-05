'use client'

import {Map, MapCameraChangedEvent, Pin, AdvancedMarker} from '@vis.gl/react-google-maps';

type Location = {
    id: string
    formattedAddress: string,
    location: {
        latitude: number,
        longitude: number
    }
}

export default function PostMap(props:{location:Location | undefined}) {   

    if (!props.location)
        return <></>

    const location = props.location;

    return (
        <Map
        style={{ height: '300px', width: '100%' }} 
            defaultZoom={16}
            mapId='DEMO_MAP_ID'
            defaultCenter={ { lat: location.location?.latitude || 0, lng: location.location?.longitude || 0 } }
        >
            <AdvancedMarker position={{ lat: location.location?.latitude || 0, lng: location.location?.longitude || 0 }}>
                <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
            </AdvancedMarker>
        </Map>
    )
}