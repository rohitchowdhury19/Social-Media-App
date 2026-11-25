import React, { useRef, useState } from 'react';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { uploadPost, uploadToImageKit } from '../../actions/UploadAction';
import publicFolder from '../../utils/publicFolder';
import { cn } from '../../utils/clsx';
import { avatarClass, buttonClass, cardClass, inputClass } from '../../utils/styles';

const PostShare = () => {
    const loading = useSelector((state) => state.postReducer.uploading);
    const [media, setMedia] = useState(null);
    const [mediaType, setMediaType] = useState('image');
    const fileRef = useRef();
    const desc = useRef();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.authReducer.authData);

    const onMediaChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setMedia(event.target.files[0]);
        }
    };

    const openFilePicker = (type) => {
        setMediaType(type);
        if (fileRef.current) {
            fileRef.current.accept = type === 'video' ? 'video/*' : 'image/*';
            fileRef.current.click();
        }
    };

    const addLocation = () => {
        const location = window.prompt('Enter location');
        if (location) {
            desc.current.value = `${desc.current.value} Location: ${location}`.trim();
        }
    };

    const addSchedule = () => {
        const schedule = window.prompt('Enter schedule/date');
        if (schedule) {
            desc.current.value = `${desc.current.value} Schedule: ${schedule}`.trim();
        }
    };

    const reset = () => {
        setMedia(null);
        setMediaType('image');
        desc.current.value = '';
        if (fileRef.current) {
            fileRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!desc.current.value.trim() && !media) {
            window.alert('Please write a caption or select a photo/video.');
            return;
        }

        const newPost = {
            userId: user._id,
            desc: desc.current.value,
        };

        if (media) {
            try {
                const uploadResult = await dispatch(uploadToImageKit(media));
                newPost.image = uploadResult.url;
                newPost.imageFileId = uploadResult.fileId;
                newPost.mediaType = mediaType;
            } catch (error) {
                console.log(error);
                window.alert('Failed to upload media to ImageKit: ' + (error.message || 'Error'));
                return;
            }
        }

        await dispatch(uploadPost(newPost));
        reset();
    };

    const optionClass = 'px-[10px] py-[5px] rounded-[10px] flex items-center justify-center gap-1 text-sm cursor-pointer hover:bg-inputColor';
    const previewMediaClass = 'w-full h-80 object-cover rounded-lg';

    return (
        <div className={cn(cardClass, 'flex gap-4')}>
            <img
                src={user.profilePicture ? publicFolder + user.profilePicture : publicFolder + 'defaultProfile.png'}
                alt=""
                className={avatarClass}
            />

            <div className="flex flex-col w-[90%] gap-4">
                <input
                    type="text"
                    placeholder="Write a caption..."
                    ref={desc}
                    className={cn(inputClass, 'rounded-[10px] p-[10px] text-[17px]')}
                />

                <div className="flex justify-around flex-wrap gap-2">
                    <div className={cn(optionClass, 'text-photo')} onClick={() => openFilePicker('image')}>
                        <PhotoOutlinedIcon />
                        Photo
                    </div>

                    <div className={cn(optionClass, 'text-video')} onClick={() => openFilePicker('video')}>
                        <PlayCircleOutlineIcon />
                        Video
                    </div>

                    <div className={cn(optionClass, 'text-location')} onClick={addLocation}>
                        <LocationOnOutlinedIcon />
                        Location
                    </div>

                    <div className={cn(optionClass, 'text-schedule')} onClick={addSchedule}>
                        <CalendarMonthOutlinedIcon />
                        Shedule
                    </div>

                    <button
                        className={cn(buttonClass, 'py-[5px] px-5 text-[15px]')}
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'uploading...' : 'Share'}
                    </button>

                    <div className="hidden">
                        <input type="file" name="myImage" accept="image/*" ref={fileRef} onChange={onMediaChange} />
                    </div>
                </div>

                {media && (
                    <div className="relative">
                        <CloseOutlinedIcon className="absolute right-4 top-2 cursor-pointer" onClick={() => setMedia(null)} />
                        {mediaType === 'video'
                            ? <video src={URL.createObjectURL(media)} controls className={previewMediaClass} />
                            : <img src={URL.createObjectURL(media)} alt="" className={previewMediaClass} />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostShare;
