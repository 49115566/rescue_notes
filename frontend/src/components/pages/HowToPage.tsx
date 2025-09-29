import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PageHeader } from '../PageHeader';
import { Separator } from '../ui/separator';

interface HowToPageProps {
  guide: string;
}

export function HowToPage({ guide }: HowToPageProps) {
  const getGuideContent = () => {
    switch (guide) {
      case 'notes':
        return {
          title: 'Using the Note App',
          sections: [
            {
              title: 'Creating Notes',
              content: [
                'Tap the "New Note" button on the home page to create a new note.',
                'Give your note a descriptive title to make it easy to find later.',
                'Start typing in the content area to add your note content.',
                'Notes are automatically saved as you type.'
              ]
            },
            {
              title: 'Editing Notes',
              content: [
                'Tap any note from the home page to view it.',
                'Tap the "Edit" button to switch to edit mode.',
                'Make your changes - they\'ll be saved automatically.',
                'Use the "View" button to see how your markdown formatting looks.'
              ]
            },
            {
              title: 'Organizing Notes',
              content: [
                'Use the search bar to quickly find specific notes.',
                'Notes are automatically sorted by last modified date.',
                'Use descriptive titles and markdown headers to structure your content.',
                'Delete notes you no longer need using the menu button (⋮).'
              ]
            },
            {
              title: 'Exporting & Sharing',
              content: [
                'Export notes as Markdown files using the export button in note view.',
                'Share notes using your device\'s native sharing features.',
                'All formatting is preserved when exporting or sharing.'
              ]
            }
          ]
        };

      case 'help':
        return {
          title: 'Using Help Features',
          sections: [
            {
              title: 'Accessing Help',
              content: [
                'Tap the help icon (?) in the top right of most pages.',
                'Help is context-aware - you\'ll see relevant information for each page.',
                'Use the back arrow to return to where you came from.'
              ]
            },
            {
              title: 'Navigation',
              content: [
                'Use the back arrow to return to the previous page.',
                'Help pages are organized by topic for easy browsing.',
                'Look for highlighted important information and warnings.'
              ]
            },
            {
              title: 'Getting Support',
              content: [
                'Use the feedback option to report issues or suggest improvements.',
                'Check the app settings for additional information.',
                'Remember that all data stays on your device for privacy.'
              ]
            }
          ]
        };

      case 'markdown':
        return {
          title: 'Markdown Syntax Guide',
          sections: [
            {
              title: 'Headers',
              content: [
                '# Header 1 - For main titles',
                '## Header 2 - For section headers',
                '### Header 3 - For subsections',
                'Use headers to structure your notes and make them scannable.'
              ]
            },
            {
              title: 'Text Formatting',
              content: [
                '**Bold text** - Use double asterisks for emphasis',
                '*Italic text* - Use single asterisks for emphasis',
                '`Inline code` - Use backticks for code or technical terms',
                'Combine formatting: ***Bold and italic***'
              ]
            },
            {
              title: 'Code Blocks',
              content: [
                'Use triple backticks (```) for multi-line code:',
                '```',
                'function example() {',
                '  return "Hello World";',
                '}',
                '```'
              ]
            },
            {
              title: 'Links',
              content: [
                '[Link text](https://example.com) - Creates clickable links',
                'Links will open in a new tab when viewed',
                'Use descriptive link text for better accessibility'
              ]
            },
            {
              title: 'Lists',
              content: [
                '- Use dashes for bullet points',
                '- Like this list',
                '- Easy to read and scan',
                '',
                '1. Use numbers for ordered lists',
                '2. Great for step-by-step instructions',
                '3. Numbers auto-update',
                '',
                'Nested lists:',
                '- Bullet level 1',
                '  - Bullet level 2',
                '    - Bullet level 3',
                '',
                '1. Numbered level 1',
                '   1. Numbered level 2',
                '      1. Numbered level 3',
                '',
                'Mixed nesting:',
                '1. A numbered item',
                '   - A bullet under it',
                '     1. A numbered under that'
              ]
            },
            {
              title: 'Task Lists',
              content: [
                '- [ ] Task item (space between brackets)',
                '- [x] Completed task (x inside brackets)',
                'Task checkboxes are for display only when viewing notes.'
              ]
            },
            {
              title: 'Images',
              content: [
                'Use: ![Alt text](https://example.com/image.png)',
                'Alt text is important for accessibility.',
                'Images will scale to fit the screen and have rounded corners.'
              ]
            },
            {
              title: 'Tables',
              content: [
                'Create simple tables:',
                '| Column A | Column B |',
                '|---|---|',
                '| A1 | B1 |',
                '| A2 | B2 |'
              ]
            },
            {
              title: 'Tips',
              content: [
                'Use the markdown help panel in the editor for quick reference.',
                'Preview your formatting by switching to view mode.',
                'Markdown makes your notes more readable and organized.',
                'Don\'t worry about memorizing everything - practice makes perfect!'
              ]
            }
          ]
        };

      case 'feedback':
        return {
          title: 'Send Feedback',
          sections: [
            {
              title: 'We Value Your Input',
              content: [
                'Your feedback helps us improve RESCUE NOTES.',
                'This is a demonstration version, so feedback is especially valuable.',
                'We\'re committed to building a tool that truly serves your needs.'
              ]
            },
            {
              title: 'What to Include',
              content: [
                'Describe what you were trying to do when you encountered an issue.',
                'Include steps to reproduce any problems.',
                'Suggest specific improvements or features you\'d like to see.',
                'Let us know what\'s working well for you too!'
              ]
            },
            {
              title: 'Contact Methods',
              content: [
                'For this demonstration, feedback collection is not yet implemented.',
                'In a real app, you would have options like:',
                '• In-app feedback forms',
                '• Email support',
                '• Community forums',
                '• Issue tracking systems'
              ]
            },
            {
              title: 'Privacy',
              content: [
                'We respect your privacy and data security.',
                'Feedback is optional and you control what information you share.',
                'Your notes and personal data remain on your device.',
                'Only feedback you explicitly send would be transmitted.'
              ]
            }
          ]
        };

      default:
        return {
          title: 'Help Guide',
          sections: [
            {
              title: 'Guide Not Found',
              content: [
                'The requested help guide could not be found.',
                'Please return to the help page and try again.'
              ]
            }
          ]
        };
    }
  };

  const guideContent = getGuideContent();

  return (
    <div className="h-screen flex flex-col">
      <PageHeader 
        title={guideContent.title}
        showBack={true}
        showHelp={false}
      />
      
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {guideContent.sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      {item === '' ? (
                        <div className="h-2" />
                      ) : item.startsWith('```') || 
                         item.startsWith('function') || 
                         item.startsWith('  return') || 
                         item.startsWith('}') ? (
                        <code className="block bg-muted p-2 rounded text-xs font-mono">
                          {item}
                        </code>
                      ) : (
                        <p className="text-sm leading-relaxed">
                          {item}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}