import { useEffect, useState } from "react";

const FestbotFields = (props:{aiIfy:Function, isThinking:boolean, festbotRes:string}) => {
    const {aiIfy, isThinking, festbotRes} = props;

    const [festbot, setFestbot] = useState<any[]>();

    const formatFestbotText = () => {
        if (festbotRes) {
            const resJson = JSON.parse(festbotRes);

            if (resJson?.performances?.length) {
                const sorted = resJson.performances.toSorted((a:any, b:any) => a.date.localeCompare(b.date)); 
                console.log(sorted)
                setFestbot(sorted);
            }
        }
    }

    useEffect(() => {
        formatFestbotText();
    }, [festbotRes])

    return (
        <div className="flex flex-col items-center mt-3">
            <button onClick={() => aiIfy(true)} type='button' className="bg-white border border-gray-500 me-2 px-2 py-2 rounded text-gray-500 uppercase font-semibold cursor-pointer disabled:bg-orange-200" disabled={isThinking}>
                'Fest Me!
            </button>

            {!!(festbot?.length) &&
                <div className="mt-5">
                    {festbot.map((item, index) => (
                            <div key={index} className="mb-3 pb-3 border-b-2">
                                <div className="font-bold text-xl">{item.artist}</div>
                                <div>{item.date}</div>
                                <div>{item.time}</div>
                                <div>{item.venue}</div>
                                <div className="mt-3">{item.description}</div>
                            </div>
                        )
                    )}
                </div>
            }
        </div>
    )
}

export default FestbotFields;