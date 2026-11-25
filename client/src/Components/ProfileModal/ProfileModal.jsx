import { Modal, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { uploadImage } from '../../actions/UploadAction';
import { updateUser } from '../../actions/UserAction';
import { cn } from '../../utils/clsx';
import { buttonClass, inputClass } from '../../utils/styles';




function ProfileModal({ modalOpened, setModalOpened, data }) {

  const theme = useMantineTheme();

  const { password, ...other } = data;
  const [formData, setFormData] = useState(other);
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const dispatch = useDispatch();
  const param = useParams();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }


  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      event.target.name === "profileImage"
        ? setProfileImage(img)
        : setCoverImage(img);
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    let UserData = { ...formData };

    if (profileImage) {
      const data = new FormData();
      const fileName = Date.now() + profileImage.name;
      data.append("name", fileName);
      data.append("file", profileImage);

      UserData.profilePicture = fileName;

      try {
        await dispatch(uploadImage(data))
      } catch (error) {
        console.log(error);
      }
    }


    if (coverImage) {
      const data = new FormData();
      const fileName = Date.now() + coverImage.name;
      data.append("name", fileName);
      data.append("file", coverImage);

      UserData.coverPicture = fileName;

      try {
        await dispatch(uploadImage(data))
      } catch (error) {
        console.log(error);
      }
    }


    await dispatch(updateUser(param.id, UserData));
    setProfileImage(null);
    setCoverImage(null);
    setModalOpened(false);
  }

  const modalInputClass = cn(inputClass, 'px-4 py-3 flex-1 min-w-0');
  const rowClass = 'flex gap-4 w-[90%] items-center';

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        size="55%"
        overlayProps={{
          color: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2],
          opacity: 0.55,
          blur: 3,
        }}
      >


        <form className={cn('flex flex-col items-center justify-center gap-6')} onSubmit={handleSubmit}>

          <h3 className="text-lg font-bold">Update Your info</h3>

          <div className={rowClass}>
            <input type="text" placeholder='First Name' className={modalInputClass} name="firstname"
              onChange={handleChange} value={formData.firstname} />
            <input type="text" placeholder='Last Name' className={modalInputClass} name="lastname"
              onChange={handleChange} value={formData.lastname} />
          </div>

          <div className={rowClass}>
            <input type="text" placeholder='Works At' className={modalInputClass} name="worksAt"
              onChange={handleChange} value={formData.worksAt} />
          </div>

          <div className={rowClass}>
            <input type="text" placeholder='Lives in' className={modalInputClass} name="livesin"
              onChange={handleChange} value={formData.livesin} />
            <input type="text" placeholder='Country' className={modalInputClass} name="country"
              onChange={handleChange} value={formData.country} />
          </div>

          <div className={rowClass}>
            <input type="text" placeholder='RelationShip Status' className={modalInputClass} name="relationship"
              onChange={handleChange} value={formData.relationship} />
          </div>

          <div className={cn(rowClass, 'flex-wrap')}>
            <h5 className="text-sm font-semibold">Profile Image</h5>
            <input type="file" name='profileImage' accept="image/*" onChange={onImageChange} className="text-sm" />
            <h5 className="text-sm font-semibold">Cover Image</h5>
            <input type="file" name='coverImage' accept="image/*" onChange={onImageChange} className="text-sm" />
          </div>

          <button className={cn(buttonClass, 'w-24 h-8')} type="submit">Update</button>
        </form>


      </Modal>

    </>
  );
}


export default ProfileModal
