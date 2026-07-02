import { Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import { BiCalendar } from "react-icons/bi";
import 'react-datepicker/dist/react-datepicker.css'

import Venue from "@/lib/models/venue";

const EventFields = (props: {
    register:Function, 
    control:any, 
    venuenameRegistration:any, 
    setValue:Function, 
    setVenueQuery:Function, 
    setIsVenueSearchOpen:Function,
    isVenueSearchOpen:boolean,
    isScheduledPost:boolean,
    venueSuggestions:Venue[],
    isVenueSearching:boolean,
    selectVenue:Function

}) => {
    const {
        register, 
        control, 
        venuenameRegistration, 
        setValue, 
        setVenueQuery, 
        setIsVenueSearchOpen,
        isVenueSearchOpen,
        isScheduledPost,
        venueSuggestions,
        isVenueSearching,
        selectVenue 
    } = props;
    return (
        <div>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
                <div>
                    <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Title</div>
                    <input
                        {...register('eventname')}
                        type='text'
                        placeholder={`What's cookin'`}
                    />
                </div>
                <div>
                    <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Date & Time</div>
                    <Controller
                        control={control}
                        name='eventdate'
                        render={({ field }) => (
                            <DatePicker
                                selected={field.value || null}
                                onChange={(date:Date | null) => field.onChange(date)}
                                showTimeSelect
                                showIcon
                                dateFormat="MMMM d, yyyy h:mm aa"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2"
                                icon={<BiCalendar />}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="mb-4 grid gap-4 md:grid-cols-2">
                <div>
                    <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Venue</div>
                    <div className="relative">
                        <input
                            {...venuenameRegistration}
                            type='text'
                            placeholder="ArtsQuest, The Funhouse, Godfrey Daniels, etc."
                            autoComplete="off"
                            onChange={(event) => {
                                venuenameRegistration.onChange(event);
                                setValue('venueid', undefined, { shouldDirty: true });
                                setVenueQuery(event.target.value);
                                setIsVenueSearchOpen(true);
                            }}
                            onFocus={() => setIsVenueSearchOpen(true)}
                            onBlur={() => {
                                window.setTimeout(() => setIsVenueSearchOpen(false), 150);
                            }}
                        />
                        <input type="hidden" {...register('venueid')} />
                        {isScheduledPost && isVenueSearchOpen && (venueSuggestions.length > 0 || isVenueSearching) &&
                            <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                                {isVenueSearching &&
                                    <div className="px-3 py-2 text-sm text-gray-500">Searching venues...</div>
                                }
                                {!isVenueSearching && venueSuggestions.map((venue) => (
                                    <button
                                        key={venue.id}
                                        type="button"
                                        className="block w-full px-3 py-2 text-left hover:bg-orange/10"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => selectVenue(venue)}
                                    >
                                        <div className="text-sm font-semibold text-gray-900">{venue.venuename}</div>
                                        {venue.address &&
                                            <div className="text-xs text-gray-500">
                                                {[venue.address].filter(Boolean).join(' | ')}
                                            </div>
                                        }
                                    </button>
                                ))}
                            </div>
                        }
                    </div>
                </div>
                <div>
                    <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Map Address</div>
                    <input
                        {...register('address')}
                        type='text'
                        placeholder="123 Main St., Bethlehem, PA"
                    />
                </div>
            </div>
        </div>
    )
}

export default EventFields;