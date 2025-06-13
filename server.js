import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { Document, Packer, Paragraph, TextRun } from "docx";

const app = express();

app.use(cors());
app.use(express.json());

const brailleMap = {
    'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑',
    'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
    'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕',
    'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
    'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵',
    ' ': ' ', ',': '⠂', '.': '⠲', '?': '⠦', '!': '⠖',
    '\'': '⠄', '’': '⠄', '‘': '⠄', '-': '⠤', ':': '⠱', ';': '⠆',
    'ch': '⠡', 'sh': '⠩', 'g‘': '⠣', 'o‘': '⠷', 'ng': '⠻'
};

function toBraille(text) {
    const lowered = text.toLowerCase();
    let result = '';
    let i = 0;

    while (i < lowered.length) {
        const next3 = lowered.slice(i, i + 3);
        const next2 = lowered.slice(i, i + 2);
        const next1 = lowered[i];

        if (brailleMap[next3]) {
            result += brailleMap[next3];
            i += 3;
        } else if (brailleMap[next2]) {
            result += brailleMap[next2];
            i += 2;
        } else if (brailleMap[next1]) {
            result += brailleMap[next1];
            i += 1;
        } else {
            result += '?';
            i += 1;
        }
    }

    return result;
}

app.post('/api/v1/generate', async (req, res) => {
    const { text } = req.body;
    const brailleText = toBraille(text);

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    children: [new TextRun({ text: brailleText, font: 'Arial', size: 48 })]
                }),
            ],
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=braille.docx');
    res.send(buffer);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('http://localhost:3000 ishlayapti');
});
