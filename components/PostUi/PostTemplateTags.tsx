'use client'

import { JSX, useEffect, useState } from 'react';
import PostLocation from './PostLocation';

export default function PostTemplateTags(props:{templateTags:Array<{
				tag: string,
				index: number,
				tagText: string
			}> | undefined, googleMapsApiKey:string | undefined}) {

    const templateTags = props.templateTags;
    const [tagComponents, setTagComponents] = useState<Array<JSX.Element>>();
    let placeholderArr:JSX.Element[] = [];

    const buildComps = () => {
        placeholderArr = [];
        if (templateTags) {
            templateTags.forEach(tag => {
                switch (tag.tag) {
                    case 'ADDRESS':
                        placeholderArr.push(<PostLocation locationData={tag} googleMapsApiKey={props.googleMapsApiKey}/>);
                        break;
                }
            })
            setTagComponents(placeholderArr)
        }
    }

    useEffect(() => {
        buildComps();
    }, [])

    return (
        <div>
            {
                (tagComponents && tagComponents.length) &&
                    tagComponents.map((comp, index) => {
                        return <div key={index}>{comp}</div>
                    })
            }
        </div>
    )
}