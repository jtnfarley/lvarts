'use client'

import { forwardRef } from "react";
import {
  BeautifulMentionsPlugin,
  type BeautifulMentionsMenuItemProps,
  type BeautifulMentionsMenuProps,
} from "lexical-beautiful-mentions";

import { searchMentionUsers } from "@/app/actions/mentions";
import imageUrl from "@/constants/imageUrl";

interface MentionsPluginProps {
  currentUserDetailsId: number;
}

type MentionMenuItemComponentProps = BeautifulMentionsMenuItemProps & {
  avatar?: string | null;
  bio?: string | null;
  displayname?: string | null;
  itemValue?: string;
  label?: string;
  userdir?: string | null;
  userdetailsid?: number | null;
};

const MentionMenu = forwardRef<HTMLUListElement, BeautifulMentionsMenuProps>(
  ({ children, className, loading: _loading, ...props }, ref) => {
    return (
      <ul
        {...props}
        ref={ref}
        className={["mention-menu", className].filter(Boolean).join(" ")}
      >
        {children}
      </ul>
    );
  },
);

MentionMenu.displayName = "MentionMenu";

const MentionMenuItem = forwardRef<HTMLLIElement, MentionMenuItemComponentProps>(
  (
    {
      selected,
      item,
      className,
      avatar: _avatar,
      bio: _bio,
      displayname: _displayname,
      itemValue: _itemValue,
      label: _label,
      userdir: _userdir,
      userdetailsid: _userdetailsid,
      ...props
    },
    ref,
  ) => {
    const avatar =
      typeof item.data?.avatar === "string" ? item.data.avatar : null;
    const userdir =
      typeof item.data?.userdir === "string" ? item.data.userdir : null;
    const displayname =
      typeof item.data?.displayname === "string" ? item.data.displayname : null;
    const avatarSrc =
      avatar && userdir
        ? `${imageUrl}/${userdir}/${avatar}`
        : "/images/melty-man.png";

    return (
      <li
        {...props}
        ref={ref}
        className={[
          "mention-menu-item",
          selected ? "selected" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <img
          src={avatarSrc}
          alt={`${item.value} avatar`}
          className="mention-menu-avatar"
        />
        <div className="mention-menu-copy">
          <div className="mention-menu-name">@{item.value}</div>
          {displayname && <div className="mention-menu-display">{displayname}</div>}
        </div>
      </li>
    );
  },
);

MentionMenuItem.displayName = "MentionMenuItem";

const EmptyMentions = () => {
  return <div className="mention-empty">No matching users</div>;
};

export default function MentionsPlugin({
  currentUserDetailsId,
}: MentionsPluginProps) {
  return (
    <BeautifulMentionsPlugin
      triggers={["@"]}
      onSearch={(_, queryString) =>
        searchMentionUsers({
          query: queryString ?? "",
          currentUserDetailsId,
        })
      }
      allowSpaces={false}
      creatable={false}
      insertOnBlur={false}
      menuItemLimit={6}
      showCurrentMentionsAsSuggestions={false}
      menuComponent={MentionMenu}
      menuItemComponent={MentionMenuItem}
      emptyComponent={EmptyMentions}
    />
  );
}
