import { useEffect } from 'react';
// import {APIProvider, Map, MapCameraChangedEvent} from '@vis.gl/react-google-maps';
import Post from '@/lib/models/post';

function PostMediaEmbed(props:{post:Post}) {

    let iframeContainer:HTMLDivElement | undefined | null

    const extractMedia = (post:Post) => {

        const linkSearch = post.content.match(/http/);

        if (linkSearch && linkSearch.input) {
            const link = linkSearch.input
            let vidId;

            if (link.match(/youtube/)) {
                vidId = link.substring(link.lastIndexOf("v=") + 2);
                const trimmedId = (vidId.match('&')) ? vidId.substring(0, vidId.indexOf('&')) : (vidId.match('<')) ? vidId.substring(0, vidId.indexOf('<')) : vidId
                return (
                    <iframe src={"https://www.youtube-nocookie.com/embed/" + trimmedId} title="Youtube"></iframe>
                )
            }
            // if (link.match(/maps.app.goo/)) {
            //     vidId = link.substring(link.lastIndexOf("/") + 1);
            //     console.log(vidId)
            //     // 
            //     // const trimmedId = (vidId.match('&')) ? vidId.substring(0, vidId.indexOf('&')) : (vidId.match('<')) ? vidId.substring(0, vidId.indexOf('<')) : vidId
            //     // <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3028.8654375669344!2d-75.38216262487963!3d40.61079244380673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c43f007c8e360f%3A0x99d72d2d044afe98!2sRailroad%20Records!5e0!3m2!1sen!2sus!4v1766344052314!5m2!1sen!2sus" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            //     return (
            //         <Map
            //             defaultZoom={13}
            //             defaultCenter={ { lat: -33.860664, lng: 151.208138 } }
            //             onCameraChanged={ (ev: MapCameraChangedEvent) =>
            //                 console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
            //             }>
            //         </Map>
            //     )
            // }
            if (link.match(/vimeo/)) {
                vidId = link.substring(link.indexOf("vimeo.com/") + 10, link.indexOf("?"))
                return (
                    <iframe src={"https://player.vimeo.com/video/" + vidId} title="Vimeo"></iframe>
                )
            }
            if (link.match(/twitch/)) {
                vidId = link.substring(link.lastIndexOf("/") + 1)
                return <iframe src={"https://player.twitch.tv/?channel=" + vidId + "&parent=localhost"} title="Twitch"></iframe>
            }
            if (link.match(/giphy/)) {
                vidId = link.substring(link.lastIndexOf("http"), link.lastIndexOf(".gif") + 4)
                return <img src={vidId} style={{ width: "100%" }} />
            }
            if (link.match(/spotify/)) {
                const httpIndex = link.indexOf("http")
                const vidLink = link.substring(httpIndex, link.indexOf('?', httpIndex))
                vidId = vidLink.substring(vidLink.lastIndexOf('/'))

                let type = "album";
                if (link.match(/track/)) type = "track";
                if (link.match(/playlist/)) type = "playlist";
                if (link.match(/episode/)) type = "episode";

                return <iframe src={"https://open.spotify.com/embed/" + type + "/" + vidId}></iframe>
            }
        }
        return false
    }

    useEffect(() => {
        if (props.post) {
            if (iframeContainer) {
                const computedStyle = window.getComputedStyle(iframeContainer);
                const width = parseFloat(computedStyle.width);
                const iframeEl = iframeContainer.querySelector('iframe')
                if (iframeEl) {
                    iframeEl.style.width = width + "px";
                    iframeEl.style.height = (width * 9 / 16) + "px";
                }
            }
        }
    },[]);

    return (
        <div id='iframeContainer' ref={(el) => { iframeContainer = el; }}>
            {(props.post) ? extractMedia(props.post) : ""}
        </div>
    )
}

export default PostMediaEmbed;
