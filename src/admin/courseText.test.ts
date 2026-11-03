import { describe, expect, it } from 'vitest';
import { PARTS_OF_SPEECH } from '../data/grammarCourses/partsOfSpeech';
import { courseToText, textToCourse } from './courseText';

const strip = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

describe('course text', () => {
  it('round-trips the built-in course', () => {
    expect(textToCourse('parts-of-speech', courseToText(PARTS_OF_SPEECH))).toEqual(strip(PARTS_OF_SPEECH));
  });

  it('reads hand-written questions with an underlined word', () => {
    const course = textToCourse(
      'tenses',
      `# Present | বর্তমান
## pr-01 | Simple present | সাধারণ বর্তমান
- অভ্যাস বোঝাতে present simple।
> I eat rice. | আমি ভাত খাই।
? ঠিক রূপটা বাছো | She [goes] to school. | goes | go; going | he/she/it-এর সাথে verb-এ s/es বসে।
? কোনটা ঠিক? |  | I am | I is; I are | I-এর সাথে am বসে।`,
    );
    const lesson = course.units[0].lessons[0];
    expect(lesson.questions).toEqual([
      { prompt: 'ঠিক রূপটা বাছো', card: 'She goes to school.', mark: 'goes', correct: 'goes', wrong: ['go', 'going'], why: 'he/she/it-এর সাথে verb-এ s/es বসে।' },
      { prompt: 'কোনটা ঠিক?', correct: 'I am', wrong: ['I is', 'I are'], why: 'I-এর সাথে am বসে।' },
    ]);
    expect(courseToText(course)).toContain('She [goes] to school.');
  });

  it('names the line of a mistake', () => {
    expect(() => textToCourse('x', '# Unit | ইউনিট\n## a-1 | A | এ\n? only | two')).toThrow('Line 3');
    expect(() => textToCourse('x', '## a-1 | A | এ')).toThrow('Line 1');
    expect(() => textToCourse('x', '# U | ই\n## a-1 | A | এ\nfocus: noun')).toThrow('"noun"');
  });
});
