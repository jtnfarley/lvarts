'use client'

import { useEffect, useState } from "react"

export default function RandoPlaceholder() {
    const [randomPlaceholder, setRandomPlaceholder] = useState('');

    const placeholders = [
        'Scream it into the ether',
        'Penny for your thoughts',
        'Your public therapy couch',
        'Go ahead, squeeze the Charmin',
        'Post no bills',
        'Your ad here',
        "Got somethin' pithy?"
    ]

    useEffect(() => {
        setRandomPlaceholder(placeholders[Math.floor(Math.random() * placeholders.length)])
    },[])

    return <div className="editor-placeholder">{randomPlaceholder}</div>
}