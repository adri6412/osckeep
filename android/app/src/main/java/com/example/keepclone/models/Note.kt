package com.example.keepclone.models

data class Note(
    val id: Int? = null,
    val title: String,
    val content: String,
    val color: String = "#ffffff"
)
