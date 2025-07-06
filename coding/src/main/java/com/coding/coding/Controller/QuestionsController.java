package com.coding.coding.Controller;

import com.coding.coding.Entity.Questions;
import com.coding.coding.Services.QuestionsService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/questions")
public class QuestionsController {

    @Autowired
    private QuestionsService questionsService;

    @PostMapping
    public Questions addQuestion(@RequestBody Questions question) {
        return questionsService.addQuestion(question);
    }


    // Add this endpoint for adding multiple questions at once
    @PostMapping("/bulk")
    public CompletableFuture<ResponseEntity<List<Questions>>> addMultipleQuestions(@RequestBody List<Questions> questions) {
        return CompletableFuture.supplyAsync(() -> {
            List<Questions> savedQuestions = questionsService.addMultipleQuestions(questions);
            return ResponseEntity.ok(savedQuestions);
        });
    }

    @GetMapping
    public List<Questions> getAllQuestions() {
        List<Questions> questions = questionsService.getAllQuestions();
        // Assign a number to each question for display (1-based index)
        for (int i = 0; i < questions.size(); i++) {
            questions.get(i).setTitle((i + 1) + ". " + questions.get(i).getTitle());
        }
        return questions;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Questions> getQuestionById(@PathVariable ObjectId id) {
        Optional<Questions> opt = questionsService.getQuestionById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Questions q = opt.get();
        if (q.getTestCases() != null && q.getTestCases().size() > 2) {
            q.setTestCases(q.getTestCases().subList(0, 2));
        }
        return ResponseEntity.ok(q);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable ObjectId id) {
        if (questionsService.getQuestionById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        questionsService.deleteQuestionById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Questions> updateQuestion(@PathVariable ObjectId id, @RequestBody Questions updated) {
        Optional<Questions> opt = questionsService.getQuestionById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Questions existing = opt.get();
        // Update fields (add more as needed)
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setDifficulty(updated.getDifficulty());
        existing.setInputFormat(updated.getInputFormat());
        existing.setOutputFormat(updated.getOutputFormat());
        existing.setTestCases(updated.getTestCases());
        // Save and return
        Questions saved = questionsService.addQuestion(existing);
        return ResponseEntity.ok(saved);
    }
}

