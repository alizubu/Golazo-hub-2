import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import MentionList from './MentionList';

export default function getMentionSuggestionConfig(players) {
  return {
    items: ({ query }) => {
      return players.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) || 
        item.username.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    },
    render: () => {
      let reactRenderer;
      let popup;

      return {
        onStart: props => {
          if (!props.clientRect) return;

          reactRenderer = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: reactRenderer.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
            theme: 'dark',
            animation: 'scale-subtle',
          });
        },
        onUpdate(props) {
          reactRenderer.updateProps(props);
          if (!props.clientRect) return;
          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          });
        },
        onKeyDown(props) {
          if (props.event.key === 'Escape') {
            popup[0].hide();
            return true;
          }
          return reactRenderer.ref?.onKeyDown(props);
        },
        onExit() {
          if (popup) {
            popup[0].destroy();
          }
          if (reactRenderer) {
            reactRenderer.destroy();
          }
        },
      };
    },
  };
}
