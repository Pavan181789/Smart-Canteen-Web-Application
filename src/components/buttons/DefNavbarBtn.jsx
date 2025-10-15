import React from 'react';
import {
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  Button,
  Center,
  MenuDivider,
  MenuItem,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../../context/AuthContext';

export default function NavbarBtn() {
  const { user, logOut } = UserAuth();
  const navigate = useNavigate();
  const handleLogOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        rounded={'full'}
        variant={'link'}
        cursor={'pointer'}
        minW={0}
      >
        <Avatar size={'sm'} name={user?.displayName || user?.email || 'User'} src={user?.photoURL || undefined} />
      </MenuButton>
      <MenuList alignItems={'center'}>
        <br />
        <Center>
          <Avatar size={'2xl'} name={user?.displayName || user?.email || 'User'} src={user?.photoURL || undefined} />
        </Center>
        <br />
        <Center>
          <p>{user.displayName}</p>
        </Center>
        <br />
        <MenuDivider />
        <MenuItem
          onClick={() => {
            navigate('/menu');
          }}
        >
          Account
        </MenuItem>
        <MenuItem>Orders</MenuItem>
        <MenuItem onClick={handleLogOut}>Logout</MenuItem>
      </MenuList>
    </Menu>
  );
}
