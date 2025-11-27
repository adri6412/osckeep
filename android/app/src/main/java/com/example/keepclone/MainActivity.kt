package com.example.keepclone

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.staggeredgrid.LazyVerticalStaggeredGrid
import androidx.compose.foundation.lazy.staggeredgrid.StaggeredGridCells
import androidx.compose.foundation.lazy.staggeredgrid.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.keepclone.api.KeepApi
import com.example.keepclone.models.Note
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import androidx.compose.ui.tooling.preview.Preview

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val prefs = getSharedPreferences("keep_prefs", Context.MODE_PRIVATE)
        val token = "Bearer " + prefs.getString("token", "")

        // Setup Retrofit
        val retrofit = Retrofit.Builder()
            .baseUrl("http://10.0.2.2:3500/") // Emulator localhost
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            
        val api = retrofit.create(KeepApi::class.java)

        setContent {
            KeepCloneTheme {
                KeepApp(api, token)
            }
        }
    }
}

@Composable
fun KeepApp(api: KeepApi, token: String) {
    var notes by remember { mutableStateOf(listOf<Note>()) }
    
    // Fetch notes
    LaunchedEffect(Unit) {
        // api.getNotes(token).enqueue(...) 
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = { /* Open Add Note */ }) {
                Text("+")
            }
        }
    ) { padding ->
        LazyVerticalStaggeredGrid(
            columns = StaggeredGridCells.Fixed(2),
            contentPadding = padding,
            modifier = Modifier.fillMaxSize().background(Color(0xFF202124))
        ) {
            items(notes) { note ->
                NoteItem(note)
            }
        }
    }
}

@Composable
fun NoteItem(note: Note) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(android.graphics.Color.parseColor(note.color))),
        modifier = Modifier.padding(4.dp).fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(8.dp)) {
            Text(text = note.title, style = MaterialTheme.typography.titleMedium)
            Text(text = note.content, style = MaterialTheme.typography.bodyMedium)
        }
    }
}

@Composable
fun KeepCloneTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = Color(0xFF202124),
            surface = Color(0xFF202124),
            onBackground = Color.White,
            onSurface = Color.White
        ),
        content = content
    )
}
