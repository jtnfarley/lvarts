import { useEffect } from 'react';

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
                    <iframe src={"https://www.youtube.com/embed/" + trimmedId} title="Youtube"></iframe>
                )
            }
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

            // if (link.match(/bandcamp/)) {
            //   vidId = link.substring(link.lastIndexOf("/")+1)
            //   if (link.match(/album/))

            //   https://sophisticatedape.bandcamp.com/track/shanklish-the-war-orphans
            //   https://sophisticatedape.bandcamp.com/album/sophisticated-tapes-vol-1
            //   return <iframe style="border: 0; width: 350px; height: 786px;" src="https://bandcamp.com/EmbeddedPlayer/album=1288355294/size=large/bgcol=ffffff/linkcol=0687f5/transparent=true/" seamless></iframe>
            //   <iframe style="border: 0; width: 350px; height: 470px;" src="https://bandcamp.com/EmbeddedPlayer/album=1288355294/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/track=636893643/transparent=true/" seamless><a href="https://sophisticatedape.bandcamp.com/album/sophisticated-tapes-vol-1">Sophisticated tApes Vol. 1 by The War Orphans</a></iframe>
            // }
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
