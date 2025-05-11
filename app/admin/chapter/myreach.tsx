import {
    DefaultEditorOptions,
    RichTextInput,
    RichTextInputToolbar,
    LevelSelect,
    FormatButtons,
    AlignmentButtons,
    ListButtons,
    LinkButtons,
    QuoteButtons,
    ClearButtons,
    useTiptapEditor,
} from 'ra-input-rich-text';
import { Extension } from '@tiptap/core';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TextAlign from '@tiptap/extension-text-align';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Heading from '@tiptap/extension-heading';
import Blockquote from '@tiptap/extension-blockquote';
import Remove from '@mui/icons-material/Remove';
import { ToggleButton } from '@mui/material';

interface RichTextInputToolbarProps {
    size?: 'small' | 'medium' | 'large' | undefined;
}

const MyRichTextInputToolbar = ({ size, ...props }: RichTextInputToolbarProps) => {
    const editor = useTiptapEditor();
  
    return (
        <RichTextInputToolbar {...props}>
            <LevelSelect size={size} />
            <FormatButtons size={size} />
            <AlignmentButtons size={size} />
            <ListButtons size={size} />
            <LinkButtons size={size} />
            <QuoteButtons size={size} />
            <ClearButtons size={size} />
            <ToggleButton
                aria-label="Add an horizontal rule"
                title="Add an horizontal rule"
                value="left"
                onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                }
                selected={editor && editor.isActive('horizontalRule')}
            >
                <Remove fontSize="inherit" />
            </ToggleButton>
        </RichTextInputToolbar>
    );
}

interface MyRichTextInputProps {
  source: string;
  label?: string;
  fullWidth?: boolean;
  sx?: any;
  validate?: (value: any) => string | undefined;
  helperText?: string;
  onChange?: (value: string) => void;
}

export const MyRichTextInput = (props: MyRichTextInputProps) => {
  const { sx, source, onChange, validate, helperText, ...rest } = props;
  
  const handleChange = (event: any) => {
    if (onChange) {
      // For rich text editor, the value is passed directly
      if (typeof event === 'string') {
        onChange(event);
      }
      // For form events, extract value from event target
      else if (event?.target?.value) {
        onChange(event.target.value);
      }
    }
  };

  return (
    <RichTextInput
      {...rest}
      source={source}
      toolbar={<MyRichTextInputToolbar />}
      onChange={handleChange}
      validate={validate}
      helperText={helperText}
      editorOptions={{
        extensions: [
          Document,
          Paragraph,
          Text,
          Bold,
          Italic,
          Strike,
          Underline,
          Link.configure({
            openOnClick: false,
          }),
          BulletList,
          OrderedList,
          ListItem,
          Heading,
          Blockquote,
          TextAlign.configure({
            types: ['heading', 'paragraph'],
          }),
          HorizontalRule,
        ],
      }}
      sx={sx}
    />
  );
};

export const MyEditorOptions = {
    ...DefaultEditorOptions,
    extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Italic,
        Strike,
        Underline,
        Link,
        BulletList,
        OrderedList,
        ListItem,
        Heading,
        Blockquote,
        ...(DefaultEditorOptions.extensions as Extension[]),
        HorizontalRule,
        TextAlign.configure({
            types: ['heading', 'paragraph'],
            alignments: ['left', 'center', 'right', 'justify'],
        }),
    ] as Extension[],
};