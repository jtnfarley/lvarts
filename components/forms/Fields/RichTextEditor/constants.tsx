import {
  BiAlignLeft,
  BiAlignRight,
  BiAlignMiddle,
  BiBold,
  BiItalic,
  BiStrikethrough,
  BiUnderline,
  BiListUl,
  BiListOl
} from "react-icons/bi";

export enum RichTextAction {
  Bold = "bold",
  Italics = "italics",
  Underline = "underline",
  Strikethrough = "strikethrough",
  LeftAlign = "leftAlign",
  CenterAlign = "centerAlign",
  RightAlign = "rightAlign",
  Divider = "divider",
  UnorderedList = "ul",
  OrderedList = "ol"
}

export const RICH_TEXT_OPTIONS = [
  { id: RichTextAction.Bold, icon: <BiBold/>, label: "Bold" },
  { id: RichTextAction.Italics, icon: <BiItalic/>, label: "Italics" },
  { id: RichTextAction.Underline, icon: <BiUnderline/>, label: "Underline" },
  {
    id: RichTextAction.Strikethrough,
    icon: <BiStrikethrough/>,
    label: "Strikethrough",
  },
  { id: RichTextAction.Divider },
  {
    id: RichTextAction.LeftAlign,
    icon: <BiAlignLeft />,
    label: "Align Left",
  },
  {
    id: RichTextAction.CenterAlign,
    icon: <BiAlignMiddle />,
    label: "Align Center",
  },
  {
    id: RichTextAction.RightAlign,
    icon: <BiAlignRight />,
    label: "Align Right",
  },
  { id: RichTextAction.Divider },
  {
    id: RichTextAction.UnorderedList,
    icon: <BiListUl />,
    label: "Unordered List",
  },
  {
    id: RichTextAction.OrderedList,
    icon: <BiListOl />,
    label: "Ordered List",
  },
];

export const LOW_PRIORITY = 1;
export const HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"];
