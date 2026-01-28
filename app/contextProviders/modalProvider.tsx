'use client'

import { PropsWithChildren, createContext, useContext, useState, useMemo, useCallback } from 'react'

import { deleteThisPost } from './modalActions'
import User from '@/lib/models/user'

type Context = {
    setIsOpen:Function
    setTitle:Function
    setType:Function
    type:string 
    title:string
    isOpen:boolean
    message:string
    postContent:string
    setMessage:Function
    setPostContent:Function
    action:string
    setAction:Function
    actionData: {
        postId?: string
        postType?: string
        eventTitle?: string
        eventDate?: Date
    }
    setActionData:Function
    triggerAction:Function
    user:User | undefined
    setUser:Function
}

const ModalContext = createContext({} as Context)

export const ModalProvider = ({ children }: PropsWithChildren) => {

    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('default title');
    const [type, setType] = useState('default type');
    const [message, setMessage] = useState('default message');
    const [postContent, setPostContent] = useState('default content');
    const [action, setAction] = useState('default action');
    const [actionData, setActionData] = useState<any>();
    const [user, setUser] = useState<User | undefined>();

    const triggerAction = () => {
        switch (action) {
            case 'deleteThisPost':
                if (actionData && actionData.postId) {
                    deleteThisPost(actionData.postId)
                }
                setAction('');
                setActionData(null);
                break;
        }
        setIsOpen(false)
    }

    const value = {
        isOpen,
        setIsOpen, 
        title,
        setTitle, 
        type,
        setType,   
        message,
        setMessage,
        postContent,
        setPostContent,
        action,
        setAction,
        triggerAction,
        actionData, 
        setActionData,
        user,
        setUser
    };

    return (
        <ModalContext.Provider value={value}>
        {children}
        </ModalContext.Provider>
    )
}

// context consumer hook
const useModalContext = () => {
  // get the context
  const context = useContext(ModalContext);

  // if `undefined`, throw an error
  if (context === undefined) {
    throw new Error("useModalContext was used outside of its Provider");
  }

  return context;
};


export const useModal = () => useModalContext()