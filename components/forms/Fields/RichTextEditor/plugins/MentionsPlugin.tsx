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
  currentUserId: string;
}

type MentionMenuItemComponentProps = BeautifulMentionsMenuItemProps & {
  avatar?: string | null;
  bio?: string | null;
  displayName?: string | null;
  itemValue?: string;
  label?: string;
  userDir?: string | null;
  userId?: string | null;
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
      displayName: _displayName,
      itemValue: _itemValue,
      label: _label,
      userDir: _userDir,
      userId: _userId,
      ...props
    },
    ref,
  ) => {
    const avatar =
      typeof item.data?.avatar === "string" ? item.data.avatar : null;
    const userDir =
      typeof item.data?.userDir === "string" ? item.data.userDir : null;
    const bio = typeof item.data?.bio === "string" ? item.data.bio : null;
    const displayName =
      typeof item.data?.displayName === "string" ? item.data.displayName : null;
    const avatarSrc =
      avatar && userDir
        ? `${imageUrl}/${userDir}/${avatar}`
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
          {displayName && <div className="mention-menu-display">{displayName}</div>}
          {bio && <div className="mention-menu-bio">{bio}</div>}
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
  currentUserId,
}: MentionsPluginProps) {
  return (
    <BeautifulMentionsPlugin
      triggers={["@"]}
      onSearch={(_, queryString) =>
        searchMentionUsers({
          query: queryString ?? "",
          currentUserId,
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
